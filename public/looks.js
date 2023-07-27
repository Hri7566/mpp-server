$(document.head).append(`
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital@0;1&display=swap');
  
    body {
        font: 20pt 'Open Sans', verdana, "DejaVu Sans", sans-serif;
        text-shadow: #444444aa 1px 1px 1px;
    }
  
    .ugly-button {
        border-radius: 5px;
        background: #44444444;
        backdrop-filter: blur(5px);
        transition: 150ms background;
    }
  
    .ugly-button:hover {
        background: #44444488;
    }
  
    #room {
        background: #44444444;
        backdrop-filter: blur(5px);
        border: 1px solid #ffffff22;
        border-radius: 5px;
    }
  
    #room .expand {
        background-color: #22222222;
        border: 1px solid #ffffff11;
        border-radius: 5px;
        transition: 300ms all ease-in-out;
    }
  
    #room .more {
        background: #22222288;
        border-radius: 5px;
        border: 1px solid #22222222;
        backdrop-filter: blur(5px);
    }
  
    #room .more .new {
        border: 1px solid #ffffff22;
        border-radius: 5px;
        background: #44444444;
    }
  
    #room .more .info {
        border-radius: 5px;
    }
  
    #room .more .info:hover {
        background: #88888822;
        transition: 300ms all;
    }
  
    #names .name {
        border-radius: 5px;
        border: 1px solid #ffffff22;
    }
  
    .participant-menu {
        border: 1px solid #ffffff22;
        border-radius: 5px;
    }
  
    .participant-menu .menu-item {
        border: 1px solid #ffffff22;
        border-radius: 5px;
        transition: 150ms all;
    }
  
    #chat {
        transition: 300ms all ease-in-out;
        text-shadow: #88888844 1px 1px 1px;
    }
  
    #chat.chatting {
        background-color: #22222288;
        backdrop-filter: blur(5px);
        border: 1px solid #ffffff22;
        box-shadow: unset;
    }
  
    #chat input {
        background: #44444422;
        backdrop-filter: blur(5px);
        border: 1px solid #ffffff22;
    }
  
    #chat.chatting input {
        border: 1px solid #ffffff66;
    }
  
    #chat.chatting input:focus {
        border: 1px solid #ffffffcc
    }
  
    #chat li {
        text-shadow: unset;
    }
  
    #chat.chatting li {
        text-shadow: unset;
    }
  
    .client-settings-button {
        transition: 150ms background;
    }
  
    .notification.classic .notification-body {
        border: 1px solid #ffffff22;
        border-radius: 5px;
        background: #22222288;
        backdrop-filter: blur(5px);
    }
  
    .notification.classic .notification-body:after {
        content: none;
    }
  
    .notification.classic .notification-body .title {
        border-bottom: 1px solid #ffffff22;
    }
  
    .notification.classic .notification-body .pack {
        border: 1px solid #ffffff22;
        background: #ffffff0a;
    }
  
    .notification.classic .notification-body .pack.enabled {
        background: #ffffff11;
    }
  
    #modal .bg {
        background: #22222225;
        opacity: 1;
        transition: 150ms all;
        backdrop-filter: blur(2px);
    }
  
    .dialog {
        background: #222222c0;
        border: 1px solid #ffffff22;
        display: flex;
    }
  
    .dialog .submit {
        background: #ffffff22;
        color: #fff;
        transition: 150ms all;
    }
  
    .dialog .submit:hover {
        background: #ffffff44;
        transition: 150ms all;
    }
  
    input[type="color"] {
        background: #ffffff44;
        border: none;
        height: 4vh;
        width: 4vh;
    }
  
    .top-button {
        background: #ffffff11;
        backdrop-filter: blur(5px);
        border: 1px solid #ffffff22;
        border-radius: 5px;
    }
  
    #volume {
        top: -16px;
    }
  
    #volume-label {
        top: 18px;
    }
  
    #volume input[type="range"] {
        background-image: url("volume2.png");
        filter: grayscale(1.0) brightness(50%);
        opacity: 0.75;
    }
  
    .cursor {
        filter: invert();
    }
  
    .cursor .name {
        border-radius: 5px;
        border: 1px solid #ffffff22;
        font-size: 8pt;
        filter: invert();
    }
  
    .cursor.owner .name:after {
        position: absolute;
        left: unset;
        right: 0;
    }
  
    #quota {
        height: 2px;
        background: #ffffff66;
    }
  
    #quota .value {
        background: #ffffffaa;
    }
  </style>
`);
