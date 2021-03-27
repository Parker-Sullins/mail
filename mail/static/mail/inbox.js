document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => loadMailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => loadMailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => loadMailbox('archive'));
  document.querySelector('#compose').addEventListener('click', composeEmail);

  // By default, load the inbox
  loadMailbox('inbox');
});



function composeEmail(reply=false, email_instance) {

  // Show compose view and hide other views !!!
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#display-email').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  document.querySelector('#reply-container').value = '';
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

    if (reply === true) {
///Adding the reply_compose function has fucked it up
        //adding duplicates
        //something with reply = true/false
        // Display email instance is also creating duplicates
        //html is not being cleared out at somepoint or a break in the code flow
        //is not doing what you think
        document.querySelector('#reply-container').append(`${email_instance.sender} wrote:`)
        document.querySelector('#compose-recipients').value = `${email_instance.recipients}`;
        document.querySelector('#compose-subject').value = `RE: ${email_instance.subject}`;
        document.querySelector('#compose-body').value = `${email_instance.body}`;

  }


  // Clear out composition fields
  //Fields for the form in the compose-form html container


  document.querySelector('#compose-form').addEventListener('submit',
      (event) => { sendEmail(event) });
}


function sendEmail(event) {

  event.preventDefault();

  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body,
      read: false
    })
  })
      .then(response => response.json())
      .then(result => {
        if (result.error) {
          alert(result.error)
        } else {
          console.log(result);
          loadMailbox('inbox')
          return false;
        }
      });

     // Is this necessary? return false;
}


function loadMailbox(mailbox) {

  getMailboxEmails(mailbox);
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#display-email').style.display = 'none';

  // Show the mailbox name
    ///refactor
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;


}


function getMailboxEmails(mailbox) {
  fetch('/emails/'+mailbox, {
    method: 'GET'
  })
      .then(response => response.json())
      .then(emails => {
        displayAllEmails(mailbox, emails);
      })
  //catch error here !!!!!!!!!!!!!!!!!
}


function displayAllEmails(mailbox, emails) {
    //clear current mailbox before creating list of emails
  document.querySelector('#emails-view').innerHTML = ''
  let ul = document.createElement('ul');
  document.querySelector('#emails-view').append(ul);


  emails.forEach(email => {

    //   const recipients = email.recipients;
   // const subject = email.subject;
    // const timestamp = email.timestamp;
      console.log(email.read)
      ///refactor
      ///Used spans instead of divs as spans are inline elements
      const recipients = `<span class="email-sender">${email.recipients}</span>`;
      const subject =  `<span class="email-subject">${email.subject}</span>`;
      const timestamp = `<span class="email-timestamp">${email.timestamp}</span>`;
 //     const archive_btn = <span class="archive-icon"><a href={}></a></span>;

      //create li element to hold inline elements for each email
      const email_element = document.createElement('li');
//get_email_instance(mailbox, li));

//refactor
      email_element.innerHTML += recipients;
      email_element.innerHTML += subject;
      email_element.innerHTML += timestamp;


      email_element.setAttribute('data-id', `${email.id}`);

      let email_instance = email
      email_element.addEventListener('click', () => getEmailInstance(mailbox, email_instance));


      document.querySelector('ul').append(email_element);

//wtf
      if (mailbox === 'inbox') {
          if (email.read === false) {
              email_element.style.backgroundColor = "grey";
          }
      }
  });
}


function getEmailInstance(mailbox, email_instance) {
  const id = email_instance.id;


  fetch(`/emails/${id}`)
      .then(response => response.json())
      .then(email_instance => {
        console.log(email_instance);

        //getEmailInstance is triggered by clicking on an individual email
        // This in turn triggers the readState function
        readState(email_instance);
        emailInstanceView(mailbox, email_instance)
      });
}


function emailInstanceView(mailbox, email_instance) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#display-email').style.display = 'block';

  //refactor?
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  const sender = email_instance.sender;
  const recipients = email_instance.recipients;
  const subject = email_instance.subject;
  const timestamp = email_instance.timestamp;
  const body = email_instance.body;

  //could be better/ plag
  let email_instance_fields= [sender, recipients, subject, timestamp, body];
//def plagerism
  document.querySelectorAll("p").forEach((field, array_index) => {
        field.innerHTML += `${email_instance_fields[array_index]}`;

  })

  if (mailbox !== "sent") {
    document.querySelector('#archive-btn').style.visibility = 'visible';
    document.querySelector('#reply-btn').style.visibility = 'visible';
    archiveState(email_instance);
    reply_email(email_instance);
    readState(email_instance);
  }else {
    document.querySelector('#archive-btn').style.visibility = 'hidden';
    document.querySelector('#reply-btn').style.visibility = 'hidden';
  }
}


function archiveState(email_instance) {
  const btn = document.querySelector("#archive-btn");


  if (email_instance.archived === true){
    btn.innerHTML = "Unarchive"
  } else {
    btn.innerHTML = "Archive"
  }


  console.log(email_instance.id)
  btn.addEventListener('click', () => {
      fetch(`/emails/${email_instance.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: !email_instance.archived
        })

      })
          .then((response) => {
            if (response.ok === true) {
              //clear out current inbox and recall api
                //not clearing out inbox, often duplicates
              document.querySelector('#emails-view').innerHTML = ''
              loadMailbox('inbox');
            } else {
                //refactor/plag
              alert('An unexpected error occurred. Email could not be archived.');
            }
          });
  });


}


function readState(email_instance) {
  console.log(email_instance.read)
  fetch(`/emails/${email_instance.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
      .then((data) => {
          if (data.ok === true) {
            console.log(data)
            console.log(email_instance.read)
            return false;
              //clear out current inbox and recall api
        } else {
            console.log(`Error updating archived status: ${data}`);
        }
      })
  }


function reply_email(email_instance) {
    const btn = document.querySelector("#reply-btn");

    btn.addEventListener('click', () => {
        composeEmail(true, email_instance);
    })

}