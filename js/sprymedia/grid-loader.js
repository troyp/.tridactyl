/*
 * Copyright 2007-2008 Allan Jardine. All rights reserved
 * Contact: allan.jardine /AT\ sprymedia.co.uk
 */
if(typeof GridLoader!="undefined"&&typeof GridControl!="undefined"){GridControl.fnClose()
}else{var GridLoader={};GridLoader.bLoadingComplete=false;GridLoader.fnLoadFile=function(c,d){var a;
if(d=="css"){a=document.createElement("link");a.type="text/css";a.rel="stylesheet";
a.href=c;a.media="screen";document.getElementsByTagName("head")[0].appendChild(a)
}else{if(d=="image"){var b=new Image(1,1);b.src=c}else{a=document.createElement("script");
a.setAttribute("language","JavaScript");a.setAttribute("src",c);document.getElementsByTagName("body")[0].appendChild(a)
}}};GridLoader.fnLoad=function(){if(typeof Grid=="object"&&typeof GridControl=="object"&&typeof jsCore=="object"){return 0
}var a=document.createElement("div");a.style.position="absolute";a.style.top="0";
a.style.left="0";a.style.color="white";a.style.padding="5px 10px";a.style.fontSize="11px";
a.style.fontFamily='"Lucida Grande", Verdana, Arial, Helvetica, sans-serif';a.style.zIndex="32501";
a.style.backgroundColor="#a2392d";a.setAttribute("id","LoadingGrid");a.appendChild(document.createTextNode("Loading Grid..."));
document.getElementsByTagName("body")[0].insertBefore(a,document.body.childNodes[0]);
GridLoader.fnLoadFile("//www.sprymedia.co.uk/design/grid/media/images/bg.png","image");
GridLoader.fnLoadFile("//www.sprymedia.co.uk/design/grid/media/images/bg_shade.png","image");
GridLoader.fnLoadFile("//www.sprymedia.co.uk/design/grid/media/images/grid.png","image");
GridLoader.fnLoadFile("//www.sprymedia.co.uk/design/grid/media/images/gutter.png","image");
GridLoader.fnLoadFile("//www.sprymedia.co.uk/design/grid/media/images/lattice.png","image");
GridLoader.fnLoadFile("//www.sprymedia.co.uk/design/grid/media/images/page.png","image");
GridLoader.fnLoadFile("//www.sprymedia.co.uk/design/grid/media/images/gutter2.png","image");
GridLoader.fnLoadFile("//www.sprymedia.co.uk/design/grid/media/images/rows.png","image");
GridLoader.fnLoadFile("//www.sprymedia.co.uk/design/grid/media/images/columns.png","image");
GridLoader.fnLoadFile("//www.sprymedia.co.uk/design/grid/media/images/margin.png","image");
GridLoader.fnLoadFile("//www.sprymedia.co.uk/design/grid/media/images/size.png","image");
GridLoader.fnLoadFile("//www.sprymedia.co.uk/design/grid/media/images/align.png","image");
GridLoader.fnLoadFile("//www.sprymedia.co.uk/design/grid/media/css/grid.css","css");
GridLoader.fnLoadFile("//www.sprymedia.co.uk/design/grid/media/js/grid-complete.js","js")
};GridLoader.fnLoad()};