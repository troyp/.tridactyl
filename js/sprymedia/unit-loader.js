/*
 * Copyright 2007-2008 Allan Jardine. All rights reserved
 * Contact: allan.jardine /AT\ sprymedia.co.uk
 */
if(typeof UnitLoader!="undefined"&&typeof Unit!="undefined"){Unit.fnClose()}else{var UnitLoader={};
UnitLoader.bLoadingComplete=false;UnitLoader.fnLoadFile=function(c,d){var a;if(d=="css"){a=document.createElement("link");
a.type="text/css";a.rel="stylesheet";a.href=c;a.media="screen";document.getElementsByTagName("head")[0].appendChild(a)
}else{if(d=="image"){var b=new Image(1,1);b.src=c}else{a=document.createElement("script");
a.type="text/javascript";a.language="JavaScript";a.src=c;document.getElementsByTagName("body")[0].appendChild(a)
}}};UnitLoader.fnLoad=function(){if(typeof Unit=="object"&&typeof jsCore=="object"){return 0
}var a=document.createElement("div");a.style.position="absolute";a.style.top="0";
a.style.left="0";a.style.color="white";a.style.padding="5px 10px";a.style.fontSize="11px";
a.style.fontFamily='"Lucida Grande", Verdana, Arial, Helvetica, sans-serif';a.style.zIndex="32501";
a.style.backgroundColor="#a2392d";a.setAttribute("id","LoadingUnit");a.appendChild(document.createTextNode("Loading Unit..."));
document.getElementsByTagName("body")[0].insertBefore(a,document.body.childNodes[0]);
UnitLoader.fnLoadFile("//www.sprymedia.co.uk/design/unit/media/css/unit.css","css");
UnitLoader.fnLoadFile("//www.sprymedia.co.uk/design/unit/media/js/unit-complete.js","js")
};UnitLoader.fnLoad()};