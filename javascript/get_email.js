      function loadGmailApi() {
        gapi.client.load('gmail', 'v1', displayInbox);
      }

      function displayInbox() {
        var request = gapi.client.gmail.users.messages.list({
          'userId': 'me',
          'labelIds': 'INBOX',
          'maxResults': 10
        });

        request.execute(function(response) {
          $.each(response.messages, function() {
            var messageRequest = gapi.client.gmail.users.messages.get({
              'userId': 'me',
              'id': this.id
            });
            messageRequest.execute(appendMessageRow);
          });
        });
      }
      
      function appendMessageRow(message) {
        $('.table-inbox tbody').append(
          '<tr>\
            <td>'+getHeader(message.payload.headers, 'From')+'</td>\
            <td>\
              <a href="#message-modal-' + message.id +
                '" data-toggle="modal" id="message-link-' + message.id+'">' +
                getHeader(message.payload.headers, 'Subject') +
              '</a>\
            </td>\
            <td>'+getHeader(message.payload.headers, 'Date')+'</td>\
          </tr>'
        );
        $('body').append(
          '<div class="modal fade" id="message-modal-' + message.id +
              '" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">\
            <div class="modal-dialog modal-lg">\
              <div class="modal-content">\
                <div class="modal-header">\
                  <button type="button"\
                          class="close"\
                          data-dismiss="modal"\
                          aria-label="Close">\
                    <span aria-hidden="true">&times;</span></button>\
                  <h4 class="modal-title" id="myModalLabel">' +
                    getHeader(message.payload.headers, 'Subject') +
                  '</h4>\
                </div>\
                <div class="modal-body">\
                  <iframe id="message-iframe-'+message.id+'" srcdoc="<p>Loading...</p>">\
                  </iframe>\
                </div>\
              </div>\
            </div>\
          </div>'
        );
        $('#message-link-'+message.id).on('click', function(){
          var ifrm = $('#message-iframe-'+message.id)[0].contentWindow.document;
          $('body', ifrm).html(getBody(message.payload));
        });
      }
      function getHeader(headers, index) {
        var header = '';
        $.each(headers, function(){
          if(this.name === index){
            header = this.value;
          }
        });
        return header;
      }
      function getBody(message) {
        var encodedBody = '';
        if(typeof message.parts === 'undefined')
        {
          encodedBody = message.body.data;
        }
        else
        {
          encodedBody = getHTMLPart(message.parts);
        }
        encodedBody = encodedBody.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
        return decodeURIComponent(escape(window.atob(encodedBody)));
      }
      function getHTMLPart(arr) {
        for(var x = 0; x <= arr.length; x++)
        {
          if(typeof arr[x].parts === 'undefined')
          {
            if(arr[x].mimeType === 'text/html')
            {
              return arr[x].body.data;
            }
          }
          else
          {
            return getHTMLPart(arr[x].parts);
          }
        }
        return '';
      }