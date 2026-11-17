(function(){
  'use strict';
  var container=document.getElementById('personal-tags-app');
  function mount(){
    if(window.WecomPatientTags.isOpen())return;
    window.WecomPatientTags.open({container:container,model:window.PatientTags,inline:true,manageOnly:true,onClose:mount});
  }
  mount();
  window.addEventListener('pagehide',function(){window.WecomPatientTags.destroy();});
  window.addEventListener('pageshow',function(event){if(event.persisted)mount();});
})();
