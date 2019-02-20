var redirect;
var login = false;
var lockHTML = {
    password: document.getElementById('pass'),
    lock: document.getElementById('unlock')
};

if (window.XMLHttpRequest) {
    // code for modern browsers
    xhttp = new XMLHttpRequest();
 } else {
    // code for old IE browsers
    xhttp = new ActiveXObject("Microsoft.XMLHTTP");
}

var createXmlhttp = function(method, pName, data, callback) {
  xhttp.onreadystatechange = callback;
  xhttp.open(method, pName, true);
  xhttp.onreadystatechange = function(){
      if(this.status === 200 && this.readyState === 4){
          redirect = JSON.parse(this.response);
          if(redirect.message === true){
              window.location.href = "http://adminillfree.surge.sh/main.html";
              login = true;
          }else{
              alert("Password Is Wrong.")
          }
      }
  }
  xhttp.send(data);
};

lockHTML.lock.addEventListener('click', function(e){
    e.preventDefault();
    var value = lockHTML.password.value;
    var urlB = 'http://theillfree2019.openode.io/password?pass='+value;
    createXmlhttp('GET', urlB);

});
