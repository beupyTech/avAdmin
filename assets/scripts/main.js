var xhttp;
var message;
var order;
var mainElement;
var orBtn;
var comBtn;
var productObj;
var selectBox;
var neworder;
var completedOrder;
var ipInfos;

var htmlElement = {};
htmlElement.newOrder = document.getElementById('newOrder');
htmlElement.messages = document.getElementById('messages');
htmlElement.mainNavigation  = document.getElementById('mainNavigation');
htmlElement.sideNavigation  = document.getElementById('sideNavigation');
htmlElement.totalMessageNum = document.getElementById('totalOrderMessage');
htmlElement.totalOrdersNum = document.getElementById('totalOrderNum');
htmlElement.backBtn = document.getElementById('goBack');
htmlElement.products = document.getElementById('products');
htmlElement.ips = document.getElementById('ips');
htmlElement.ips.style.display = 'none';

if (window.XMLHttpRequest) {
    // code for modern browsers
    xhttp = new XMLHttpRequest();
 } else {
    // code for old IE browsers
    xhttp = new ActiveXObject("Microsoft.XMLHTTP");
};

var createXmlhttp = function(method, pName, callback) {
  xhttp.onreadystatechange = callback;
  xhttp.open(method, pName, true);
  xhttp.send();
};

var serverRequestPost = function(url, data, callback){
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if(xhr.status === 200){
            callback(this.response);
        }else{
            console.log(this.response);
        };
    };
    var stringifyData = JSON.stringify(data);
    xhr.send(stringifyData);
};
var serverReq = function(){
    var contactURL = "http://theillfree2019.openode.io/contact";
    var ordersURL = "http://theillfree2019.openode.io/orders";
    var ipData =  "http://theillfree2019.openode.io/getIp";
    createXmlhttp("GET", contactURL, function(){
        console.log("Running");
        if(this.status === 200 && this.readyState === 4){
          message = JSON.parse(this.response);
          htmlElement.totalMessageNum.innerHTML = message.messages.length;
          createXmlhttp("GET", ordersURL, function(){
            if(this.status === 200 && this.readyState === 4){
              order = JSON.parse(this.response);
              htmlElement.totalOrdersNum.innerHTML = order.orders.length;
              parseorder(order.orders);
              createXmlhttp("GET", "http://theillfree2019.openode.io/getProduct", ()=>{
                  if(this.status === 200 && this.readyState === 4){
                      productObj = JSON.parse(this.response);
                      //console.log(productObj);
              createXmlhttp("GET", "http://theillfree2019.openode.io/getPing", ()=>{
                  if(this.status === 200 && this.readyState === 4){
                      views = JSON.parse(this.response);
                      console.log(views.message);
                      var websiteViews = document.getElementById("websiteViews");
                      websiteViews.innerHTML = views.message;
                      createXmlhttp("GET", ipData, ()=>{ 
                          if(this.status === 200 && this.readyState ===4){
                              ipInfos = JSON.parse(this.response);
                              htmlElement.ips.style.display = 'block';
                          }
                      });
                  };
              });
                  };
              });
            };
        });
        };
    });
};
serverReq();

//---orders and message code started------------------------//
//calculating Order
function parseorder(data){
    neworder= [];
    completedOrder= [];
    if(typeof data === 'object' && data instanceof Array){
        for(let i=0; i<data.length; i++){
            
          if(!data[i].completed){
              neworder.push(data[i]);
          }else{
              completedOrder.push(data[i]);
          }  
        };
    }else{
        return false;
    };
    var newOrderElem = document.getElementById("newOrders");
    newOrderElem.innerHTML = neworder.length;
}

//retrieving click new Order
htmlElement.newOrder.addEventListener('click', function(event){
  event.preventDefault();
  createXmlhttp("GET", 'tables.html', function(){
    if(this.readyState == 4){
      htmlElement.mainNavigation.classList.add("col-md-6");
      htmlElement.sideNavigation.innerHTML = "";
      htmlElement.mainNavigation.innerHTML = "";
      htmlElement.mainNavigation.innerHTML = this.response;
      mainElement = document.getElementById("dataArea");
      //console.log(neworder);
      //console.log(completedOrder);
      createOrders(neworder);
    }
  });
});

//messages
htmlElement.messages.addEventListener('click', function(event){
  event.preventDefault();
  createXmlhttp("GET", 'messageTable.html', function(){
    if(this.readyState == 4){
      htmlElement.mainNavigation.classList.remove("col-md-6");  
      htmlElement.mainNavigation.classList.add("col-md-10");
      htmlElement.sideNavigation.innerHTML = "";
      htmlElement.mainNavigation.innerHTML = "";
      htmlElement.mainNavigation.innerHTML = this.response;
      mainElement = document.getElementById("dataArea");
      createMessages(message.messages);
    }
  });
});


function createMessages(messageArray){
    messageArray.forEach(function(item, index){
        let element = createMessageElem(item, index);
        mainElement.innerHTML += element;
    });
};

function createMessageElem(item, index){
    return `<tr><td>${index}</td><td>${item.name}</td><td>${item.email}</td><td>${item.subject}</td><td>${item.message}</td></tr>`;
};

function createOrders(ordersArray){
    if(ordersArray.length > 0){
        ordersArray.forEach(function(item, index){
            let element = createOrderElem(item, index);
            mainElement.innerHTML += element;
        });
        orBtn = document.getElementsByClassName('orderBtn');
        comBtn = document.getElementsByClassName('comBtn');
        orBtnFun(ordersArray);
        comBtnFun(ordersArray);
    }else{
        mainElement.innerHTML = "No Data to show here";
    };
};

function createOrderElem(item, index){
    return `<tr><td>${index}</td><td>${item.name}</td><td>${item.paymentMode}</td><td><button class='orderBtn btn btn-success glyphicon glyphicon-paste	
'></button><button class='comBtn btn btn-danger glyphicon glyphicon-ok	
'></button></td></tr>`;
};

//do it without let
function orBtnFun(ordersArray){
    for(let i=0; i<orBtn.length; i++ ){
        orBtn[i].addEventListener('click', function(e){
            e.preventDefault();
            createXmlhttp("GET", "ordersView.html", function(){
                if(this.readyState === 4){
                    htmlElement.sideNavigation.classList.add("col-md-6");
                    htmlElement.sideNavigation.innerHTML = "";
                    htmlElement.sideNavigation.innerHTML = this.response;
                    putOrderData(ordersArray[i]);
                }
            });
        });
    };
};

function changeOrderState(id){
    let idValue = parseInt(id);
    let orders = order.orders;
    let match = false;
    for(let i= 0; i<orders.length; i++){
        //this below is contraversial
        if(orders[i].id === id){
            orders[i].completed= true;
            //do server function calling here
            createXmlhttp("GET", "http://theillfree2019.openode.io/updateOrder?id="+i, function(){
                console.log(this.response);
            })
            break;
        };
    };
    console.log(orders);
    parseorder(orders);
    mainElement.innerHTML = "";
    createOrders(neworder);
};

function comBtnFun(ordersArray){
    for(let i=0; i<ordersArray.length; i++ ){
        comBtn[i].addEventListener('click', function(e){
            e.preventDefault();
            let id = ordersArray[i].id;
            changeOrderState(id);
        });
    };
};

function putOrderData(data){
    var orderField = {
    pills:document.getElementById('dataPills'),
    mg:document.getElementById('dataMg'),
    shipping:document.getElementById('dataShipping'),
    price:document.getElementById('dataPrice'),
    productName:document.getElementById('dataProduct'),
    name:document.getElementById('dataName'),
    lastName:document.getElementById('dataLastName'),
    middleName:document.getElementById('dataMiddleName'),
    phone:document.getElementById('dataPhn'),
    email:document.getElementById('dataEmail'),
    stretName:document.getElementById('dataStreet'),
    city:document.getElementById('dataCity'),
    zip:document.getElementById('dataZip'),
    state:document.getElementById('dataState'),
    country:document.getElementById('dataCountry'),
    paymentType:document.getElementById('dataPaymentType'),
    cardHolName:document.getElementById('dataCCName'),
    cardNumber:document.getElementById('dataCCNum'),
    cvv:document.getElementById('dataCVV'),
    expiry:document.getElementById('dataExpiry'),
    bStreetName:document.getElementById('dataBillingStreetName'),
    bCity:document.getElementById('dataBillingCity'),
    bZip:document.getElementById('dataBillingZip'),
    bState:document.getElementById('dataBillingState'),
    bCountry:document.getElementById('dataBillingCountry'),
    coinName:document.getElementById('dataCoinName'),
  };
    orderField.pills.innerHTML = data.pills;
    orderField.mg.innerHTML = data.mg;
    orderField.shipping.innerHTML = data.shipping;
    orderField.price.innerHTML = data.price;
    orderField.productName.innerHTML = data.product;
    orderField.name.innerHTML = data.name;
    orderField.middleName.innerHTML = data.middleName;
    orderField.lastName.innerHTML = data.lastName;
    orderField.phone.innerHTML = data.phone;
    orderField.email.innerHTML = data.email;
    orderField.stretName.innerHTML = data.streetAddress;
    orderField.city.innerHTML = data.city;
    orderField.zip.innerHTML = data.zipcode;
    orderField.state.innerHTML = data.state;
    orderField.country.innerHTML = data.country;
    orderField.paymentType.innerHTML = data.paymentMode;
    orderField.cardHolName.innerHTML = data.cardName;
    orderField.cardNumber.innerHTML = data.cardNum;
    orderField.cvv.innerHTML = data.cvv;
    orderField.expiry.innerHTML = data.expiry;
    orderField.bStreetName.innerHTML = data.billingStreet;
    orderField.bCity.innerHTML = data.billingCity;
    orderField.bZip.innerHTML = data.billingZipcode;
    orderField.bState.innerHTML = data.billingState;
    orderField.bCountry.innerHTML = data.billingCountry;
    orderField.coinName.innerHTML = data.coinSelected;
};

htmlElement.backBtn.addEventListener('click', function(e){
    e.preventDefault();
    window.location.href = "http://adminillfree.surge.sh";
});

//product Displaying and Updating;

function productData(){
   var productUpElem;
   var upProduct= document.getElementById("upProduct");
   var updateResult= document.getElementById("updateResult");
   selectBox.addEventListener('change', function(e){
      e.preventDefault();
      let slectedIndex = selectBox.selectedIndex;
       productUpElem = {
           id: document.getElementById("productId"),
           productName: document.getElementById("productName"),
           productPrice: document.getElementById("productPrice"),
           productPill: document.getElementById("productPill"),
           productShipping: document.getElementById("productShipping"),
           productMg: document.getElementById("productMg"),
           product: document.getElementById("product")
       };
       if(slectedIndex){
           productUpElem.id.innerHTML = productObj[slectedIndex-1].id;
           productUpElem.productName.value = productObj[slectedIndex-1].productName;
           productUpElem.productPrice.value = productObj[slectedIndex-1].productPrice;
           productUpElem.productPill.value = productObj[slectedIndex-1].productName;
           productUpElem.productShipping.value = productObj[slectedIndex-1].productShipping;
           productUpElem.productMg.value = productObj[slectedIndex-1].productMg;
           productUpElem.product.value = productObj[slectedIndex-1].product;
       };
   });
    upProduct.addEventListener('click', (e)=>{
        e.preventDefault();
        if(selectBox.selectedIndex){
            let outputData = {
              id: parseInt(productUpElem.id.innerHTML),
              productName: productUpElem.productName.value,
              productPrice: productUpElem.productPrice.value,
              productPill: productUpElem.productPill.value,
              productShipping: productUpElem.productShipping.value,
              productMg: productUpElem.productMg.value,
              product: productUpElem.product.value
            };
            if(typeof(outputData.id) === 'number'){
                upProduct.style.display = "none";
                serverRequestPost("http://theillfree2019.openode.io/updateProduct", outputData, (res)=>{
                  updateResult.innerHTML = "Update Completed, clicking again will change the value again.";
                  updateResult.style.color = "red";
                  upProduct.style.display = "inline";
                  console.log(res);  
                });
            }else{
                alert("Wrong Parameter");
            };
            
        }else{
            alert("Choose a product");
        };
    });
    
};

//creating product option
function createOption(){
    selectBox= document.getElementById("selectProduct");
    productObj.forEach((item, index)=>{
        var option= document.createElement("option");
        option.text = `${item.productName} ${item.productPrice}`;
        console.log(selectBox);
        selectBox.add(option);
    });
    productData();
};

//products page handler
htmlElement.products.addEventListener('click', (e)=>{
    e.preventDefault();
    createXmlhttp("GET", "products.html", function(){
        if(this.readyState === 4){
          htmlElement.mainNavigation.classList.remove("col-md-6", "col-md-10");  
          htmlElement.mainNavigation.classList.add("col-md-10");
          htmlElement.sideNavigation.innerHTML = "";
          htmlElement.mainNavigation.innerHTML = "";
          htmlElement.mainNavigation.innerHTML = this.response;
          createOption();
        };
    });
});

//Product Displaying and Updating Finished;
//ip displaying templating

//ip element
function createIpElement(elem){ 
    console.log(elem);
    if(elem.info === null){
    return `<tr><td>${elem.ip}</td><td>${elem.count}</td><td>localhost</td><td>localhost</td><td>localhost</td><td>localhost</td><td>${elem.lastSeen}</td></tr>`;
    }else{
     return `<tr><td>${elem.ip}</td><td>${elem.count}</td><td>${elem.info.country}</td><td>${elem.info.city}</td><td>${elem.info.timezone}</td><td>${elem.info.ll[0]},${elem.info.ll[1]}</td><td>${elem.lastSeen}</td></tr>`;   
    }
}

//ipOption
function ipOption() {
    ipInfos.data.forEach((item, index)=>{
        let elems = createIpElement(item);
        mainElement.innerHTML += elems;
    });
}

//ip page handling

htmlElement.ips.addEventListener('click', (e)=>{
    e.preventDefault();
    createXmlhttp("GET", "ipInfo.html", function(){
        if(this.readyState === 4){
          htmlElement.mainNavigation.classList.remove("col-md-6", "col-md-10");  
          htmlElement.mainNavigation.classList.add("col-md-11");
          htmlElement.sideNavigation.innerHTML = "";
          htmlElement.mainNavigation.innerHTML = "";
          htmlElement.mainNavigation.innerHTML = this.response;
          mainElement = document.getElementById("dataArea");
          ipOption();
        };
    });
});











