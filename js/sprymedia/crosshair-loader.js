/*
 * Copyright 2007-2008 Allan Jardine. All rights reserved
 * Contact: allan.jardine /AT\ sprymedia.co.uk
 */
if(typeof CrosshairLoader!="undefined"&&typeof Crosshair!="undefined"){Crosshair.fnClose()
}else{var CrosshairLoader={};CrosshairLoader.bLoadingComplete=false;CrosshairLoader.fnLoadFile=function(c,d){var a;
if(d=="css"){a=document.createElement("link");a.type="text/css";a.rel="stylesheet";
a.href=c;a.media="screen";document.getElementsByTagName("head")[0].appendChild(a)
}else{if(d=="image"){var b=new Image(1,1);b.src=c}else{a=document.createElement("script");
a.setAttribute("language","JavaScript");a.setAttribute("src",c);document.getElementsByTagName("body")[0].appendChild(a)
}}};CrosshairLoader.fnLoad=function(){if(typeof Crosshair=="object"&&typeof jsCore=="object"){return 0
}var a=document.createElement("div");a.style.position="absolute";a.style.top="0";
a.style.left="0";a.style.color="white";a.style.padding="5px 10px";a.style.fontSize="11px";
a.style.fontFamily='"Lucida Grande", Verdana, Arial, Helvetica, sans-serif';a.style.zIndex="32501";
a.style.backgroundColor="#a2392d";a.setAttribute("id","LoadingCrosshair");a.appendChild(document.createTextNode("Loading Crosshair..."));
document.getElementsByTagName("body")[0].insertBefore(a,document.body.childNodes[0]);
CrosshairLoader.fnLoadFile("//www.sprymedia.co.uk/design/crosshair/media/js/crosshair-complete.js","js")
};CrosshairLoader.fnLoad()};
