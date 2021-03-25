document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views !!!
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#display-email').style.display = 'none';
  // Block is doing what??
  // Compose View is being shown in this case but why?
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  //Fields for the form in the compose-form html container
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  document.querySelector('#compose-form').addEventListener('submit',
      (event) => { send_email(event) });
}


function send_email(event) {
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
      .then(response => response.json())
      .then(result => {
        if (result.error) {
          alert(result.error)
        } else {
          console.log(result);
          load_mailbox('sent')
          return false;
        }
      });

     // Is this necessary? return false;
}


function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#display-email').style.display = 'block';

  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;


}


function get_mailbox_emails(mailbox) {
  fetch('emails/${mailbox}', {
    method: 'GET'
  })
      .then(response => response.json())
      .then(result => {
        display_all_emails(mailbox, result);
      })
  //catch error here 
}