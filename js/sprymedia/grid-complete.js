/*
 * Copyright 2007-2010 Allan Jardine. All rights reserved
 * Contact: allan.jardine /AT\ sprymedia.co.uk
 */
JSCore=function(){this.fnInit()};JSCore.prototype={fnInit:function(){this.aStack=new Array();
this.oInterval;this.bLoaded;this.aEventCache=new Array();this._fnLogInit()},addListener:function(d){var a;
var e;typeof d.sLabel!="undefined"?null:d.sLabel="";typeof d.oObj!="undefined"?null:d.oObj=null;
typeof d.mOverrideScope!="undefined"?null:d.mOverrideScope=null;if(d.mScope){if(d.mScope===true){a=d.oObj
}else{a=d.mScope}}else{a=d.mElement}e=function(f){if(!jsCore){return 0}else{d.fnCallback.call(a,jsCore._getEvent(f),d.oObj)
}return false};if(typeof(d.mElement)=="string"){var c=document.getElementById(d.mElement);
jsCore._addEvent({nNode:c,sType:d.sType,fnCallback:d.fnCallback,fnCallbackWrapped:e,sLabel:d.sLabel})
}else{if(d.mElement){if(d.mElement.nodeName||d.mElement==window){jsCore._addEvent({nNode:d.mElement,sType:d.sType,fnCallback:d.fnCallback,fnCallbackWrapped:e,sLabel:d.sLabel})
}else{for(var b=0;b<d.mElement.length;b++){jsCore._addEvent({nNode:d.mElement[b],sType:d.sType,fnCallback:d.fnCallback,fnCallbackWrapped:e,sLabel:d.sLabel})
}}}}},_addEvent:function(a){this.aEventCache[this.aEventCache.length++]={nNode:a.nNode,sType:a.sType,fnWrapped:a.fnCallbackWrapped,fn:a.fnCallback,sLabel:a.sLabel};
if(a.nNode.addEventListener){a.nNode.addEventListener(a.sType,a.fnCallbackWrapped,false)
}else{if(a.nNode.attachEvent){a.nNode.attachEvent("on"+a.sType,a.fnCallbackWrapped)
}}},removeListener:function(b){this.aiDelete=new Array();if(typeof b.sLabel=="string"){for(var a=0;
a<this.aEventCache.length;a++){if(this.aEventCache[a].sLabel==b.sLabel){jsCore._removeEvent({nNode:this.aEventCache[a].nNode,sType:this.aEventCache[a].sType,fn:this.aEventCache[a].fn})
}}}else{if(typeof b.mElement=="string"){nElement=document.getElementById(b.mElement);
jsCore._removeEvent({nNode:nElement,sType:b.sType,fn:b.fnCallback})}else{if(!b.mElement.length){jsCore._removeEvent({nNode:b.mElement,sType:b.sType,fn:b.fnCallback})
}else{for(var a=0;a<b.mElement.length;a++){jsCore._removeEvent({nNode:b.mElement[a],sType:b.sType,fn:b.fnCallback})
}}}}for(var a=this.aiDelete.length-1;a>=0;a--){this.aEventCache.splice(this.aiDelete[a],1)
}},_removeEvent:function(b){for(var a=0;a<this.aEventCache.length;a++){if(b.nNode==this.aEventCache[a].nNode&&b.sType==this.aEventCache[a].sType&&b.fn==this.aEventCache[a].fn){if(b.nNode.removeEventListener){b.nNode.removeEventListener(b.sType,this.aEventCache[a].fnWrapped,false)
}else{if(b.nNode.detachEvent){b.nNode.detachEvent("on"+b.sType,this.aEventCache[a].fnWrapped)
}}break}}this.aiDelete[this.aiDelete.length++]=a},_getEvent:function(a){return a||window.event
},getElementFromEvent:function(a){var b;if(a.target){b=a.target}else{if(a.srcElement){b=a.srcElement
}}if(b.nodeType==3){b=b.parentNode}return(b)},_log_aDatabase:new Array(),fnLog:function(b,a){},_fnLogInit:function(){if(document.addEventListener){document.addEventListener("keydown",this._fnLogShowHide,true)
}else{if(document.attachEvent){document.attachEvent("onkeydown",this._fnLogShowHide)
}}},_fnLogShowHide:function(a){a=a||window.event;var c=a.keyCode||a.which;var b=String.fromCharCode(c).toLowerCase();
if(a.ctrlKey&&a.shiftKey&&b=="l"){alert("target key store detected "+a.shiftKey+" "+b+" "+c)
}}};var jsCore=new JSCore();jsCore.bAvailable=true;if(typeof DesignCore!="undefined"){DesignCore=undefined
}var DesignCore={fnCreateBox:function(a){var b=document.createElement("div");b.setAttribute("style","position: absolute; ");
if(typeof a.sPosition!="undefined"){if(a.sPosition=="fixed"&&document.all&&!window.opera&&typeof document.body.style.maxHeight=="undefined"){b.style.position="absolute"
}else{b.style.position=a.sPosition}}else{b.style.position="absolute"}typeof a.sId!="undefined"?b.setAttribute("id",a.sId):null;
typeof a.sClass!="undefined"?b.className=a.sClass:null;typeof a.sBackgroundColour!="undefined"?b.style.backgroundColor=a.sBackgroundColour:null;
typeof a.sColour!="undefined"?b.style.color=a.sColour:null;typeof a.sColour!="undefined"?b.style.color=a.sColour:null;
typeof a.sTop!="undefined"?b.style.top=a.sTop:null;typeof a.sRight!="undefined"?b.style.right=a.sRight:null;
typeof a.sBottom!="undefined"?b.style.bottom=a.sBottom:null;typeof a.sLeft!="undefined"?b.style.left=a.sLeft:null;
if(typeof a.sTop=="undefined"||typeof a.sBottom=="undefined"){typeof a.sHeight!="undefined"?b.style.height=a.sHeight:null;
if(a.sHeight=="1px"){b.style.overflow="hidden"}}if(typeof a.sLeft=="undefined"||typeof a.sRight=="undefined"){typeof a.sWidth!="undefined"?b.style.width=a.sWidth:null
}typeof a.sMarginTop!="undefined"?b.style.marginTop=a.sMarginTop:null;typeof a.sMarginRight!="undefined"?b.style.marginRight=a.sMarginRight:null;
typeof a.sMarginBottom!="undefined"?b.style.marginBottom=a.sMarginBottom:null;typeof a.sMarginLeft!="undefined"?b.style.marginLeft=a.sMarginLeft:null;
typeof a.sPadding!="undefined"?b.style.padding=a.sPadding:null;typeof a.iZIndex!="undefined"?b.style.zIndex=a.iZIndex:null;
if(typeof a.fOpacity!="undefined"){b.style.opacity=a.fOpacity;if(b.style.filter=="string"){b.style.filter="alpha(opacity="+a.fOpacity*100+")"
}}return b},fnGetPos:function(b){var c=0;var a=0;if(b.offsetParent){c=b.offsetLeft;
a=b.offsetTop;while(b=b.offsetParent){c+=b.offsetLeft;a+=b.offsetTop}}return[c,a]
},fnPageX:function(a){iX=a.pageX?a.pageX:a.clientX+document.body.scrollLeft+document.documentElement.scrollLeft;
return iX},fnPageY:function(a){iY=a.pageY?a.pageY:a.clientY+document.body.scrollTop+document.documentElement.scrollTop;
return iY},fnGetElementFromEvent:function(a){var b;if(!a){var a=window.event}if(a==null){return null
}if(a.target){b=a.target}else{if(a.srcElement){b=a.srcElement}}if(b.nodeType==3){b=b.parentNode
}return(b)},fnGetElementsByClassName:function(g,e,d){if(e==null){e="*"}if(d==null){d=document
}var b=new Array();var h=new RegExp("\\b"+g+"\\b");var a=d.getElementsByTagName(e);
for(var f=0,c=a.length;f<c;f++){if(h.test(a[f].className)){b.push(a[f])}}return(b)
},fnSetSelectColourDisplay:function(a,b){var d=b.getElementsByTagName("div");var c=this.fnGetElementsByClassName("colour_selected","div",b);
if(c[0]){c[0].className="colour "+(c[0].className.split(" ")[1])}switch(a){case"#000000":case"rgb(0, 0, 0)":d[0].className="colour_selected c1";
break;case"#BF0303":case"#bf0303":case"rgb(191, 3, 3)":d[1].className="colour_selected c2";
break;case"#BF0361":case"#bf0361":case"rgb(191, 3, 97)":d[2].className="colour_selected c3";
break;case"#85026C":case"#85026c":case"rgb(133, 2, 108)":d[3].className="colour_selected c4";
break;case"#34176E":case"#34176e":case"rgb(52, 23, 110)":d[4].className="colour_selected c5";
break;case"#00438A":case"#00438a":case"rgb(0, 67, 138)":d[5].className="colour_selected c6";
break;case"#006066":case"rgb(0, 96, 102)":d[6].className="colour_selected c7";break;
case"#00734D":case"#00734d":case"rgb(0, 115, 77)":d[7].className="colour_selected c8";
break;case"#00892C":case"#00892c":case"rgb(0, 137, 44)":d[8].className="colour_selected c9";
break;case"#F3C300":case"#f3c300":case"rgb(243, 195, 0)":d[9].className="colour_selected c10";
break;case"#888A85":case"#888a85":case"rgb(136, 138, 133)":d[10].className="colour_selected c11";
break;case"#FFFFFF":case"#ffffff":case"rgb(255, 255, 255)":d[11].className="colour_selected c12";
break;default:console.log("Unkown colour: "+a);break}},fnGetSliderValue:function(b){var a=b.parentNode.offsetWidth-b.offsetWidth;
return(b.style.left.split("px")[0]/a)},fnSetSliderValue:function(c,b){var a=c.parentNode.offsetWidth-c.offsetWidth;
c.style.left=(a*b)+"px"},fnCreateCookie:function(b,e){var d=365;var a=new Date();
a.setTime(a.getTime()+(d*24*60*60*1000));var c="; expires="+a.toGMTString();document.cookie=b+"="+e+c+"; path=/"
},fnReadCookie:function(e){var a=e+"=";var d=document.cookie.split(";");for(var b=0;
b<d.length;b++){var f=d[b];while(f.charAt(0)==" "){f=f.substring(1,f.length)}if(f.indexOf(a)==0){return f.substring(a.length,f.length)
}}return null},fnGetStyle:function(a,b){if(a.nodeName=="SCRIPT"){return""}var c="";
if(document.defaultView&&document.defaultView.getComputedStyle){c=document.defaultView.getComputedStyle(a,"").getPropertyValue(b)
}else{if(a.currentStyle){b=b.replace(/\-(\w)/g,function(d,e){return e.toUpperCase()
});c=a.currentStyle[b]}}return c},toJsonString:function(a){return this.toJsonStringArray(a).join("")
},toJsonStringArray:function(a,c){c=c||new Array();var b;switch(typeof a){case"object":if(a){if(a.constructor==Array){c.push("[");
for(var d=0;d<a.length;++d){if(d>0){c.push(",")}this.toJsonStringArray(a[d],c)}c.push("]");
return c}else{if(typeof a.toString!="undefined"){c.push("{");var f=true;for(var d in a){var e=c.length;
if(!f){c.push(",")}this.toJsonStringArray(d,c);c.push(":");this.toJsonStringArray(a[d],c);
if(c[c.length-1]==b){c.splice(e,c.length-e)}else{f=false}}c.push("}");return c}}return c
}c.push("null");return c;case"unknown":case"undefined":case"function":c.push(b);return c;
case"string":c.push('"');c.push(a.replace(/(["\\])/g,"\\$1").replace(/\r/g,"").replace(/\n/g,"\\n"));
c.push('"');return c;default:c.push(String(a));return c}}};if(typeof Grid=="undefined"){var Grid={}
}Grid.goContainer={sVertAlign:null,sHorizAlign:null,sWidth:null,sHeight:null};Grid.goMargins={sTop:null,sBottom:null,sLeft:null,sRight:null};
Grid.oGrids={iColumns:null,sColumnWidth:null,sGutterWidth:null,iRows:null,sRowHeight:null,sGutterHeight:null};
Grid.oColours={sPage:"black",sPageMargins:"blue",sGridVertical:"green",sGridHoriz:"grey",sGutter:"red",iPageMarginsOpacity:1,iGridVerticalOpacity:1,iGridHorizOpacity:1,iGutterOpacity:0.15};
Grid._oCalc={iHeight:null,iWidth:null,iColumns:null,iColumnWidth:null,iGutterWidth:null,iRows:null,iVerticalHeight:null,iGutterHeight:null};
Grid._oZIndexes={iBase:32101,iPage:32102,iPageMargins:32105,iGutter:32103,iGrid:32104};
Grid.fnInit=function(){};Grid.fnChangeContainer=function(a){if(a=="width"){document.getElementById("GridContainer").style.width=this.goContainer.sWidth
}else{if(a=="height"){document.getElementById("GridContainer").style.height=this.goContainer.sHeight
}}};Grid.fnCreateContainer=function(){this.fnCalculatePageSize();var b;var c;if(document.getElementById("GridContainer")){document.getElementsByTagName("body")[0].removeChild(document.getElementById("GridContainer"))
}c=this._oCalc.iWidth+"px";b=this._oCalc.iHeight+"px";var a=DesignCore.fnCreateBox({sHeight:b,sWidth:c,sId:"GridContainer",iZIndex:this._oZIndexes.iBase});a.style.pointerEvents='none';
var e=document.getElementsByTagName("body")[0].offsetHeight+"px";var d=document.getElementsByTagName("body")[0].offsetWidth+"px";
switch(this.goContainer.sHorizAlign){case"right":a.style.right=0;c!=d&&this.goContainer.sWidth!="100%"?a.style.borderLeft="1px solid "+this.oColours.sPage:null;
break;case"center":a.style.left="50%";a.style.marginLeft="-"+(this._oCalc.iWidth/2)+"px";
if(this.goContainer.sWidth!="100%"){a.style.borderLeft="1px solid "+this.oColours.sPage;
a.style.borderRight="1px solid "+this.oColours.sPage}break;default:a.style.left=0;
c!=d&&this.goContainer.sWidth!="100%"?a.style.borderRight="1px solid "+this.oColours.sPage:null;
break}switch(this.goContainer.sVertAlign){case"bottom":a.style.bottom=0;b!=e&&this.goContainer.sHeight!="100%"?a.style.borderTop="1px solid "+this.oColours.sPage:null;
break;case"center":a.style.top="0px";a.style.marginTop="0px";if(this.goContainer.sHeight!="100%"){a.style.borderTop="1px solid "+this.oColours.sPage;
a.style.borderBottom="1px solid "+this.oColours.sPage}break;default:a.style.top=0;
b!=e&&this.goContainer.sHeight!="100%"?a.style.borderBottom="1px solid "+this.oColours.sPage:null;
break}a.style.overflow="hidden";document.body.appendChild(a)};Grid.fnDrawMargins=function(){var c=document.getElementById("GridContainer");
c.appendChild(DesignCore.fnCreateBox({sTop:this.goMargins.sTop,sLeft:0,sHeight:"1px",sWidth:"100%",sBackgroundColour:this.oColours.sPageMargins,fOpacity:this.oColours.iPageMarginsOpacity,iZIndex:this._oZIndexes.iPageMargins}));
c.appendChild(DesignCore.fnCreateBox({sTop:0,sRight:this.goMargins.sRight,sHeight:"100%",sWidth:"1px",sMarginLeft:"-1px",sBackgroundColour:this.oColours.sPageMargins,fOpacity:this.oColours.iPageMarginsOpacity,iZIndex:this._oZIndexes.iPageMargins}));
c.appendChild(DesignCore.fnCreateBox({sBottom:this.goMargins.sBottom,sLeft:0,sHeight:"1px",sWidth:"100%",sMarginTop:"-1px",sBackgroundColour:this.oColours.sPageMargins,fOpacity:this.oColours.iPageMarginsOpacity,iZIndex:this._oZIndexes.iPageMargins}));
c.appendChild(DesignCore.fnCreateBox({sTop:0,sLeft:this.goMargins.sLeft,sHeight:"100%",sWidth:"1px",sBackgroundColour:this.oColours.sPageMargins,fOpacity:this.oColours.iPageMarginsOpacity,iZIndex:this._oZIndexes.iPageMargins}));
var e=this.fnConvertToWidth(this.goMargins.sTop)+this.fnConvertToWidth(this.goMargins.sBottom);
var d=this.fnConvertToWidth(this.goMargins.sLeft)+this.fnConvertToWidth(this.goMargins.sRight);
var f=c.offsetHeight-e;var a=c.offsetWidth-d-2;var b=DesignCore.fnCreateBox({sId:"ContentArea",sTop:this.goMargins.sTop,sLeft:this.goMargins.sLeft,sHeight:f+"px",sWidth:a+"px"});
b.style.overflow="hidden";c.appendChild(b)};Grid.fnCalculateVerticalGrid=function(){var c=document.getElementById("ContentArea");
if(this.oGrids.iColumns!=null){this.oGrids.iColumns!=0?this._oCalc.iColumns=this.oGrids.iColumns:this._oCalc.iColumns=1;
this._oCalc.iGutterWidth=this.fnConvertToWidth(this.oGrids.sGutterWidth);var a=c.offsetWidth;
var b=a-(this._oCalc.iGutterWidth*(this.oGrids.iColumns-1));this._oCalc.iColumnWidth=b/this.oGrids.iColumns
}else{var a=c.offsetWidth;this._oCalc.iColumnWidth=this.fnConvertToWidth(this.oGrids.sColumnWidth);
this._oCalc.iGutterWidth=this.fnConvertToWidth(this.oGrids.sGutterWidth);this._oCalc.iColumns=a/(this._oCalc.iColumnWidth+this._oCalc.iGutterWidth)
}};Grid.fnDrawVerticalGrid=function(){var a=document.getElementById("ContentArea");
var e;var h;var f;var k;var g=DesignCore.fnCreateBox({sTop:0,sLeft:0,sHeight:"100%",sWidth:"1px",sBackgroundColour:this.oColours.sGridVertical,fOpacity:this.oColours.iGridVerticalOpacity,iZIndex:this._oZIndexes.iGrid});
var c=DesignCore.fnCreateBox({sTop:0,sLeft:0,sHeight:"100%",sWidth:"1px",sBackgroundColour:this.oColours.sGridVertical,fOpacity:this.oColours.iGridVerticalOpacity,iZIndex:this._oZIndexes.iGrid});
var b=DesignCore.fnCreateBox({sTop:0,sLeft:0,sHeight:"100%",sWidth:this._oCalc.iGutterWidth+"px",sBackgroundColour:this.oColours.sGutter,fOpacity:this.oColours.iGutterOpacity,iZIndex:this._oZIndexes.iGutter});
for(var d=1;d<this._oCalc.iColumns;d++){d==1?e=this._oCalc.iColumnWidth*d:e=(this._oCalc.iColumnWidth*d)+(this._oCalc.iGutterWidth*(d-1));
h=g.cloneNode(false);h.style.left=e+"px";a.appendChild(h);if(this.oGrids.sGutterWidth!=null&&this.oGrids.sGutterWidth!=0){f=c.cloneNode(false);
f.style.left=(e+this._oCalc.iGutterWidth)+"px";a.appendChild(f);k=b.cloneNode(false);
k.style.left=e+"px";a.appendChild(k)}}};Grid.fnCalculateHorizontalGrid=function(){var c=document.getElementById("ContentArea");
if(this.oGrids.iRows!=null){this.oGrids.iRows!=0?this._oCalc.iRows=this.oGrids.iRows:this._oCalc.iRows=1;
this._oCalc.iGutterHeight=this.fnConvertToHeight(this.oGrids.sGutterHeight);var b=c.offsetHeight;
var a=b-(this._oCalc.iGutterHeight*(this.oGrids.iRows-1));this._oCalc.iRowHeight=a/this._oCalc.iRows
}else{var b=c.offsetHeight;this._oCalc.iRowHeight=this.fnConvertToHeight(this.oGrids.sRowHeight);
this._oCalc.iGutterHeight=this.fnConvertToHeight(this.oGrids.sGutterHeight);this._oCalc.iRows=b/(this._oCalc.iRowHeight+this._oCalc.iGutterHeight)
}};Grid.fnDrawHorizontalGrid=function(){var b=document.getElementById("ContentArea");
var f;var a;var e;var h;var d;var m=DesignCore.fnCreateBox({sTop:0,sLeft:0,sHeight:"1px",sWidth:"100%",sBackgroundColour:this.oColours.sGridHoriz,fOpacity:this.oColours.iGridHorizOpacity,iZIndex:this._oZIndexes.iGrid});
var c=DesignCore.fnCreateBox({sTop:0,sLeft:0,sHeight:"1px",sWidth:"100%",sBackgroundColour:this.oColours.sGridHoriz,fOpacity:this.oColours.iGridHorizOpacity,iZIndex:this._oZIndexes.iGrid});
var l=DesignCore.fnCreateBox({sTop:0,sLeft:0,sHeight:this._oCalc.iGutterHeight+"px",sWidth:"100%",sBackgroundColour:this.oColours.sGutter,fOpacity:this.oColours.iGutterOpacity,iZIndex:this._oZIndexes.iGutter});
var k=DesignCore.fnCreateBox({sTop:0,sLeft:0,sHeight:this._oCalc.iGutterHeight+"px",sWidth:this._oCalc.iColumnWidth+"px",sBackgroundColour:this.oColours.sGutter,fOpacity:this.oColours.iGutterOpacity,iZIndex:this._oZIndexes.iGutter});
for(var g=1;g<this._oCalc.iRows;g++){g==1?f=this._oCalc.iRowHeight*g:f=(this._oCalc.iRowHeight*g)+(this._oCalc.iGutterHeight*(g-1));
a=m.cloneNode(false);a.style.top=f+"px";b.appendChild(a);if(this.oGrids.sGutterHeight!=null&&this.oGrids.sGutterHeight!=0){e=c.cloneNode(false);
e.style.top=(f+this._oCalc.iGutterHeight)+"px";b.appendChild(e);if(this._oCalc.iColumns<=1){h=l.cloneNode(false);
h.style.top=f+"px";b.appendChild(h)}else{for(j=0;j<this._oCalc.iColumns;j++){j==0?iLeft=0:iLeft=(this._oCalc.iColumnWidth+this._oCalc.iGutterWidth)*j;
d=k.cloneNode(false);d.style.top=f+"px";d.style.left=iLeft+"px";b.appendChild(d)}}}}};
Grid.fnConvertToWidth=function(c){if(!c||c==null||c==""){return 0}var b;var d=document.getElementsByTagName("body")[0];
var a=DesignCore.fnCreateBox({sWidth:c});d.appendChild(a);b=a.offsetWidth;d.removeChild(d.lastChild);
return(b)};Grid.fnConvertToHeight=function(b){if(!b||b==null||b==""){return 0}var d;
var c=document.getElementsByTagName("body")[0];var a=DesignCore.fnCreateBox({sHeight:b});
c.appendChild(a);d=a.offsetHeight;c.removeChild(c.lastChild);return(d)};Grid.fnCalculatePageSize=function(){var c;
var b=document.body.offsetHeight;var d=document.body.offsetWidth;var a=document.documentElement.clientHeight;
var e=document.documentElement.clientWidth;if(this.goContainer.sHeight.match("%")){c=this.goContainer.sHeight.slice(0,this.goContainer.sHeight.length-1);
if(a<b){this._oCalc.iHeight=(b/100)*c}else{this._oCalc.iHeight=(a/100)*c}}else{this._oCalc.iHeight=this.fnConvertToHeight(this.goContainer.sHeight)
}if(this.goContainer.sWidth.match("%")){c=this.goContainer.sWidth.slice(0,this.goContainer.sWidth.length-1);
if(e<d){this._oCalc.iWidth=(d/100)*c}else{this._oCalc.iWidth=(e/100)*c}}else{this._oCalc.iWidth=this.fnConvertToWidth(this.goContainer.sWidth)
}};Grid.bAvailable=true;if(typeof GridControl=="undefined"){var GridControl={}}GridControl._oDrag={nTarget:null,iNodeStartX:null,iNodeStartY:null,iMouseStartX:null,iMouseStartY:null};
GridControl.oPanel={sX:null,sY:null};GridControl.fnDraw=function(){Grid.fnCreateContainer();
Grid.fnDrawMargins();Grid.fnCalculateVerticalGrid();Grid.fnCalculateHorizontalGrid();
this.fnPopulateCalculated();Grid.fnDrawVerticalGrid();Grid.fnDrawHorizontalGrid();
this.fnSaveState()};GridControl.fnMouseMove=function(a){var b;if(this._oDrag.nTarget.className=="slider"){b=this._oDrag.iNodeStartX+a.clientX-this._oDrag.iMouseStartX;
if(b>0&&b<this._oDrag.nTarget.parentNode.offsetWidth-this._oDrag.nTarget.offsetWidth){this._oDrag.nTarget.style.left=b+"px"
}else{if(b<=0){this._oDrag.nTarget.style.left="0px"}else{this._oDrag.nTarget.style.left=(this._oDrag.nTarget.parentNode.offsetWidth-this._oDrag.nTarget.offsetWidth)+"px"
}}}else{this._oDrag.nTarget.style.left=(this._oDrag.iNodeStartX+a.clientX-this._oDrag.iMouseStartX)+"px";
this._oDrag.nTarget.style.top=(this._oDrag.iNodeStartY+a.clientY-this._oDrag.iMouseStartY)+"px"
}};GridControl.fnMouseSelect=function(a){var b=this._getElementFromEvent(a);if(b.getAttribute("id")=="GridControl_DragHandle"){this._oDrag.nTarget=document.getElementById("GridControl");
this._oDrag.iNodeStartX=this._oDrag.nTarget.offsetLeft;this._oDrag.iNodeStartY=this._oDrag.nTarget.offsetTop;
this._oDrag.iMouseStartX=a.clientX;this._oDrag.iMouseStartY=a.clientY;jsCore.addListener({mElement:document,sType:"mouseup",fnCallback:this.fnMouseRelease,oObj:this,mScope:true,sLabel:"GCEvent"});
jsCore.addListener({mElement:document,sType:"mousemove",fnCallback:this.fnMouseMove,oObj:this,mScope:true,sLabel:"GCEvent"})
}else{if(b.className=="slider"){this._oDrag.nTarget=b;this._oDrag.iNodeStartX=this._oDrag.nTarget.offsetLeft;
this._oDrag.iMouseStartX=a.clientX;jsCore.addListener({mElement:document,sType:"mouseup",fnCallback:this.fnMouseRelease,oObj:this,mScope:true,sLabel:"GCEvent"});
jsCore.addListener({mElement:document,sType:"mousemove",fnCallback:this.fnMouseMove,oObj:this,mScope:true,sLabel:"GCEvent"})
}}};GridControl.fnMouseRelease=function(a){jsCore.removeListener({mElement:document,sType:"mouseup",fnCallback:this.fnMouseRelease});
jsCore.removeListener({mElement:document,sType:"mousemove",fnCallback:this.fnMouseMove});
if(this._oDrag.nTarget){if(this._oDrag.nTarget.getAttribute("id")=="GridControl"){this.oPanel.sY=document.getElementById("GridControl").style.top;
this.oPanel.sX=document.getElementById("GridControl").style.left;this.fnSaveState()
}else{if(this._oDrag.nTarget&&this._oDrag.nTarget.className=="slider"){switch(this._oDrag.nTarget.getAttribute("id")){case"MarginOpacity":Grid.oColours.iPageMarginsOpacity=DesignCore.fnGetSliderValue(this._oDrag.nTarget);
break;case"ColOpacity":Grid.oColours.iGridVerticalOpacity=DesignCore.fnGetSliderValue(this._oDrag.nTarget);
break;case"RowOpacity":Grid.oColours.iGridHorizOpacity=DesignCore.fnGetSliderValue(this._oDrag.nTarget);
break;case"GutterOpacity":Grid.oColours.iGutterOpacity=DesignCore.fnGetSliderValue(this._oDrag.nTarget);
break}this.fnDraw()}}}};GridControl.fnInitPanel=function(){this.fnCreateHtml();jsCore.addListener({mElement:document.getElementById("GridControl"),sType:"mousedown",fnCallback:this.fnMouseSelect,oObj:this,mScope:true,sLabel:"GCEvent"});
this.nGridControl=document.getElementById("GridControl");this.nPageWidth=document.getElementById("ioPageWidth");
this.nPageWidthUnit=document.getElementById("sPageWidthUnit");this.nPageHeight=document.getElementById("ioPageHeight");
this.nPageHeightUnit=document.getElementById("sPageHeightUnit");this.nMarginTop=document.getElementById("ioMarginTop");
this.nMarginTopUnit=document.getElementById("sMarginTopUnit");this.nMarginRight=document.getElementById("ioMarginRight");
this.nMarginRightUnit=document.getElementById("sMarginRightUnit");this.nMarginBottom=document.getElementById("ioMarginBottom");
this.nMarginBottomUnit=document.getElementById("sMarginBottomUnit");this.nMarginLeft=document.getElementById("ioMarginLeft");
this.nMarginLeftUnit=document.getElementById("sMarginLeftUnit");this.nColCount=document.getElementById("ioColCount");
this.nColWidth=document.getElementById("ioColWidth");this.nColWidthUnit=document.getElementById("sColWidthUnit");
this.nRowCount=document.getElementById("ioRowCount");this.nRowHeight=document.getElementById("ioRowHeight");
this.nRowHeightUnit=document.getElementById("sRowHeightUnit");this.nColCountAuto=DesignCore.fnGetElementsByClassName("auto","div",document.getElementById("Columns"))[0];
this.nColWidthAuto=DesignCore.fnGetElementsByClassName("auto","div",document.getElementById("Columns"))[1];
this.nRowCountAuto=DesignCore.fnGetElementsByClassName("auto","div",document.getElementById("Rows"))[0];
this.nRowWidthAuto=DesignCore.fnGetElementsByClassName("auto","div",document.getElementById("Rows"))[1];
this.nColGutterWidth=document.getElementById("ioColGutterWidth");this.nColGutterWidthUnit=document.getElementById("sColGutterWidthUnit");
this.nRowGutterHeight=document.getElementById("ioRowGutterHeight");this.nRowGutterHeightUnit=document.getElementById("sRowGutterHeightUnit");
this.nHorizAlign=document.getElementById("horiz_align");this.nVertAlign=document.getElementById("vert_align");
jsCore.addListener({mElement:document.getElementById("GridControl").getElementsByTagName("input"),sType:"keyup",fnCallback:this.fnChangeValues,oObj:this,mScope:true,sLabel:"GCEvent"});
jsCore.addListener({mElement:DesignCore.fnGetElementsByClassName("select","div",document.getElementById("GridControl")),sType:"click",fnCallback:this.fnSelectMenuOpen,oObj:this,mScope:true,sLabel:"GCEvent"});
jsCore.addListener({mElement:"GridControl_SelectBg",sType:"click",fnCallback:this.fnSelectMenuClose,oObj:this,mScope:true,sLabel:"GCEvent"});
jsCore.addListener({mElement:document.getElementById("GridControl_Select").getElementsByTagName("div"),sType:"click",fnCallback:this.fnSelectMenuSelect,oObj:this,mScope:true,sLabel:"GCEvent"});
jsCore.addListener({mElement:DesignCore.fnGetElementsByClassName("align_ip","div",document.getElementById("GridControl")),sType:"click",fnCallback:this.fnSetAlign,oObj:this,mScope:true,sLabel:"GCEvent"});
jsCore.addListener({mElement:document.getElementById("GridControl_Fold"),sType:"click",sLabel:"GCEvent",fnCallback:function(){if(this.className=="folded"){this.className="open";
document.getElementById("GridControl").style.width="399px";GridControl.oPanel.bOpen=true
}else{this.className="folded";document.getElementById("GridControl").style.width="19px";
GridControl.oPanel.bOpen=false}GridControl.fnSaveState()}});jsCore.addListener({mElement:document.getElementById("GridControl_Print"),sType:"click",fnCallback:this.fnPrintDisplay,oObj:this,mScope:true,sLabel:"GCEvent"});
jsCore.addListener({mElement:DesignCore.fnGetElementsByClassName("colour_picker","div",document.getElementById("GridControl")),sType:"click",fnCallback:this.fnSetColour,oObj:this,mScope:true,sLabel:"GCEvent"});
jsCore.addListener({mElement:DesignCore.fnGetElementsByClassName("control_switcher","div",document.getElementById("GridControl")),sType:"click",fnCallback:this.fnSwitchControls,oObj:this,mScope:true,sLabel:"GCEvent"});
jsCore.addListener({mElement:document.getElementById("GridControl_Close"),sType:"click",fnCallback:this.fnClose,oObj:this,mScope:true,sLabel:"GCEvent"});
var c=this.fnGetState();if(c!=null){Grid.goContainer=c.oContainer;Grid.goMargins=c.oMargins;
Grid.oGrids=c.oGrid;Grid.oColours=c.oColours;this.oPanel=c.oPanel;if(this.oPanel.sX!=null){this.nGridControl.style.left=this.oPanel.sX;
this.nGridControl.style.top=this.oPanel.sY}if(this.oPanel.bOpen===false){document.getElementById("GridControl_Fold").className="folded";
document.getElementById("GridControl").style.width="19px"}}else{Grid.goContainer={sVertAlign:"top",sHorizAlign:"center",sWidth:"800px",sHeight:"100%"};
Grid.goMargins={sTop:"1em",sBottom:"1em",sLeft:"1em",sRight:"1em"};Grid.oGrids={iColumns:3,sColumnWidth:null,sGutterWidth:"1em",iRows:null,sRowHeight:"1em",sGutterHeight:null};
Grid.oColours={sPage:"#000000",sPageMargins:"#00438A",sGridVertical:"#00892C",sGridHoriz:"#888A85",sGutter:"#BF0303",iPageMarginsOpacity:1,iGridVerticalOpacity:1,iGridHorizOpacity:1,iGutterOpacity:0.15}
}var a=window.innerHeight||document.documentElement.clientHeight;if(this.fnGetValue(this.oPanel.sY)>a){this.nGridControl.style.top="10px";
this.oPanel.sY="10px";this.fnSaveState()}if(navigator.userAgent.indexOf("WebKit")!=-1){var d=RegExp("( AppleWebKit/)([^.+ ]+)").exec(navigator.userAgent);
var b=d[2].split(".")[0]*1;if(b<523){this.nGridControl.style.position="absolute"}}this.fnDisplayAuto();
this.fnDisplayAlign();this.nGridControl.style.display="block";Grid.fnCreateContainer();
Grid.fnDrawMargins();Grid.fnCalculateVerticalGrid();Grid.fnCalculateHorizontalGrid();
this.fnPopulatePanel();Grid.fnDrawVerticalGrid();Grid.fnDrawHorizontalGrid();this.fnDisplayColours();
this.fnDisplayOpacity();this.fnPreloadImages();jsCore.addListener({mElement:window,sType:"resize",fnCallback:function(){GridControl.fnReSize.call(GridControl)
},sLabel:"GCEvent"})};GridControl.fnReSize=function(){Grid.fnCreateContainer();Grid.fnDrawMargins();
Grid.fnCalculateVerticalGrid();Grid.fnCalculateHorizontalGrid();Grid.fnDrawVerticalGrid();
Grid.fnDrawHorizontalGrid()};GridControl.fnPreloadImages=function(){var a=["horiz_left.jpg","horiz_center.jpg","horiz_right.jpg","vert_top.jpg","vert_center.jpg","vert_bottom.jpg","colours_black_close.png","colours_grey_close.png"];
var c=new Image();for(var b=0;b<a.length;b++){c.src="media/images/"+a[b]}};GridControl.fnSwitchControls=function(g){var h=this._getElementFromEvent(g);
if(h.parentNode.getAttribute("id")=="Align"){return}var c=DesignCore.fnGetElementsByClassName("level5","div",h.parentNode)[0];
var b=500;var k=25;var d;var a;var f;if(c.style.left==""||c.style.left=="0px"){h.className="control_switcher control_switcher_close";
d=-321;a=b/k;f=parseInt(d/a);this.fnAnimateRun(c,a,f,d,k,0,"right")}else{h.className="control_switcher control_switcher_open";
d=322;a=b/k;f=parseInt(d/a);this.fnAnimateRun(c,a,f,0,k,-322,"left")}};GridControl.fnAnimateRun=function(d,b,f,a,g,e,c){if(c=="right"&&e+f<=a){d.style.left=a+"px";
return 1}else{if(c=="left"&&e+f>=a){d.style.left=a+"px";return 1}}e+=f;d.style.left=e+"px";
setTimeout(function(){GridControl.fnAnimateRun(d,b,f,a,g,e,c)},g)};GridControl.fnDisplayOpacity=function(){DesignCore.fnSetSliderValue(document.getElementById("MarginOpacity"),Grid.oColours.iPageMarginsOpacity);
DesignCore.fnSetSliderValue(document.getElementById("ColOpacity"),Grid.oColours.iGridVerticalOpacity);
DesignCore.fnSetSliderValue(document.getElementById("RowOpacity"),Grid.oColours.iGridHorizOpacity);
DesignCore.fnSetSliderValue(document.getElementById("GutterOpacity"),Grid.oColours.iGutterOpacity)
};GridControl.fnSetColour=function(b){var c=this._getElementFromEvent(b);var a;c.currentStyle?a=c.currentStyle.backgroundColor:a=document.defaultView.getComputedStyle(c,null).getPropertyValue("background-color");
switch(c.parentNode.getAttribute("id")){case"PagePicker":Grid.oColours.sPage=a;break;
case"MarginPicker":Grid.oColours.sPageMargins=a;break;case"ColPicker":Grid.oColours.sGridVertical=a;
break;case"RowPicker":Grid.oColours.sGridHoriz=a;break;case"GutterPicker":Grid.oColours.sGutter=a;
break;default:break}this.fnDisplayColours();this.fnDraw()};GridControl.fnDisplayColours=function(){var a=DesignCore.fnGetElementsByClassName("colour_picker","div",document.getElementById("GridControl"));
DesignCore.fnSetSelectColourDisplay(Grid.oColours.sPage,a[0]);DesignCore.fnSetSelectColourDisplay(Grid.oColours.sPageMargins,a[1]);
DesignCore.fnSetSelectColourDisplay(Grid.oColours.sGridVertical,a[2]);DesignCore.fnSetSelectColourDisplay(Grid.oColours.sGridHoriz,a[3]);
DesignCore.fnSetSelectColourDisplay(Grid.oColours.sGutter,a[4])};GridControl.fnDisplayAuto=function(){if(Grid.oGrids.iColumns==null){this.nColCountAuto.style.display="block";
this.nColWidthAuto.style.display="none"}else{this.nColCountAuto.style.display="none";
this.nColWidthAuto.style.display="block"}if(Grid.oGrids.iRows==null){this.nRowCountAuto.style.display="block";
this.nRowWidthAuto.style.display="none"}else{this.nRowCountAuto.style.display="none";
this.nRowWidthAuto.style.display="block"}};GridControl.fnSetAlign=function(a){var b=this._getElementFromEvent(a);
switch(b.getAttribute("id")){case"horiz_left":Grid.goContainer.sHorizAlign="left";
break;case"horiz_center":Grid.goContainer.sHorizAlign="center";break;case"horiz_right":Grid.goContainer.sHorizAlign="right";
break;case"vert_top":Grid.goContainer.sVertAlign="top";break;case"vert_center":Grid.goContainer.sVertAlign="center";
break;case"vert_bottom":Grid.goContainer.sVertAlign="bottom";break;default:break}this.fnDisplayAlign();
this.fnDraw()};GridControl.fnDisplayAlign=function(a){switch(Grid.goContainer.sHorizAlign){case"left":this.nHorizAlign.className="horiz_left";
break;case"center":this.nHorizAlign.className="horiz_center";break;case"right":this.nHorizAlign.className="horiz_right";
break;default:break}switch(Grid.goContainer.sVertAlign){case"top":this.nVertAlign.className="vert_top";
break;case"center":this.nVertAlign.className="vert_center";break;case"bottom":this.nVertAlign.className="vert_bottom";
break;default:break}};GridControl.fnSelectMenuOpen=function(f){var g=this._getElementFromEvent(f);
var d=this._getPos(g);var b=document.getElementById("GridControl_Select");var c=document.getElementById("GridControl_SelectBg");
var a=g.getAttribute("id").slice(2);a=a.slice(0,a.length-4);this._sSelectId=a;switch(document.getElementById("io"+a+"Unit").innerHTML){case"px":break;
case"%":d.iTop-=19;break;case"em":d.iTop-=(2*19);break;case"%":d.iTop-=(3*19);break;
default:break}b.style.top=d.iTop+"px";b.style.left=d.iLeft+"px";b.style.display="block";
c.style.display="block"};GridControl.fnSelectMenuSelect=function(a){var b=this._getElementFromEvent(a);
var c=b.getAttribute("id");document.getElementById("io"+this._sSelectId+"Unit").innerHTML=c;
document.getElementById("s"+this._sSelectId+"Unit").value=c;this.fnSelectMenuClose(a);
this.fnChangeValues(a,null,"s"+this._sSelectId+"Unit")};GridControl.fnSelectMenuClose=function(c){var a=document.getElementById("GridControl_Select");
var b=document.getElementById("GridControl_SelectBg");if(c.preventDefault){c.preventDefault()
}else{c.returnValue=false}a.style.display="none";b.style.display="none"};GridControl.fnChangeValues=function(d,a,c){if(d.preventDefault){d.preventDefault()
}if(c==null){var f=this._getElementFromEvent(d);var b=f.getAttribute("id")}else{var b=c
}if(f.nodeName=="INPUT"){cKey=d.keyCode?d.keyCode:d.which;if(cKey==38){f.value=f.value*1+1
}else{if(cKey==40&&f.value>0){f.value=f.value*1-1}}}switch(b){case"ioPageWidth":case"sPageWidthUnit":if(this.nPageWidth.value==""||!this.fnIsNumeric(this.nPageWidth.value)){this.nPageWidth.className="error";
return}this.nPageWidth.className="";Grid.goContainer.sWidth=(this.nPageWidth.value*1)+this.nPageWidthUnit.value;
break;case"ioPageHeight":case"sPageHeightUnit":if(this.nPageHeight.value==""||!this.fnIsNumeric(this.nPageHeight.value)){this.nPageHeight.className="error";
return}this.nPageHeight.className="";Grid.goContainer.sHeight=(this.nPageHeight.value*1)+this.nPageHeightUnit.value;
break;case"ioMarginTop":case"sMarginTopUnit":if(this.nMarginTop.value==""||!this.fnIsNumeric(this.nMarginTop.value)){this.nMarginTop.className="error";
return}this.nMarginTop.className="";Grid.goMargins.sTop=(this.nMarginTop.value*1)+this.nMarginTopUnit.value;
break;case"ioMarginRight":case"sMarginRightUnit":if(this.nMarginRight.value==""||!this.fnIsNumeric(this.nMarginRight.value)){this.nMarginRight.className="error";
return}this.nMarginRight.className="";Grid.goMargins.sRight=(this.nMarginRight.value*1)+this.nMarginRightUnit.value;
break;case"ioMarginBottom":case"sMarginBottomUnit":if(this.nMarginBottom.value==""||!this.fnIsNumeric(this.nMarginBottom.value)){this.nMarginBottom.className="error";
return}this.nMarginBottom.className="";Grid.goMargins.sBottom=(this.nMarginBottom.value*1)+this.nMarginBottomUnit.value;
break;case"ioMarginLeft":case"sMarginLeftUnit":if(this.nMarginLeft.value==""||!this.fnIsNumeric(this.nMarginLeft.value)){this.nMarginLeft.className="error";
return}this.nMarginLeft.className="";Grid.goMargins.sLeft=(this.nMarginLeft.value*1)+this.nMarginLeftUnit.value;
break;case"ioColCount":if(this.nColCount.value==""||!this.fnIsNumeric(this.nColCount.value)||this.nColCount.value*1<0){this.nColCount.className="error";
return}this.nColCount.className="";Grid.oGrids.iColumns=(this.nColCount.value*1)*1;
Grid.oGrids.sColumnWidth=null;this.fnDisplayAuto();break;case"ioColWidth":case"sColWidthUnit":if(this.nColWidth.value==""||!this.fnIsNumeric(this.nColWidth.value)||this.nColWidth.value*1<=0){this.nColWidth.className="error";
return}this.nColWidth.className="";Grid.oGrids.iColumns=null;Grid.oGrids.sColumnWidth=(this.nColWidth.value*1)+this.nColWidthUnit.value;
this.fnDisplayAuto();break;case"ioRowCount":if(this.nRowCount.value==""||!this.fnIsNumeric(this.nRowCount.value)||this.nRowCount.value*1<0){this.nRowCount.className="error";
return}this.nRowCount.className="";Grid.oGrids.iRows=(this.nRowCount.value*1)*1;Grid.oGrids.sRowHeight=null;
this.fnDisplayAuto();break;case"ioRowHeight":case"sRowHeightUnit":if(this.nRowHeight.value==""||!this.fnIsNumeric(this.nRowHeight.value)||this.nRowHeight.value*1<=0){this.nRowHeight.className="error";
return}this.nRowHeight.className="";Grid.oGrids.iRows=null;Grid.oGrids.sRowHeight=(this.nRowHeight.value*1)+this.nRowHeightUnit.value;
this.fnDisplayAuto();break;case"ioColGutterWidth":case"sColGutterWidthUnit":if(this.nColGutterWidth.value==""||!this.fnIsNumeric(this.nColGutterWidth.value)){this.nColGutterWidth.className="error";
return}this.nColGutterWidth.className="";Grid.oGrids.sGutterWidth=(this.nColGutterWidth.value*1)+this.nColGutterWidthUnit.value;
break;case"ioRowGutterHeight":case"sRowGutterHeightUnit":if(this.nRowGutterHeight.value==""||!this.fnIsNumeric(this.nRowGutterHeight.value)){this.nRowGutterHeight.className="error";
return}this.nRowGutterHeight.className="";Grid.oGrids.sGutterHeight=(this.nRowGutterHeight.value*1)+this.nRowGutterHeightUnit.value;
break;default:console.log("No function set");return}this.fnDraw()};GridControl.fnPopulatePanel=function(){this._fnSetValueUnitPair("PageWidth",Grid.goContainer.sWidth);
this._fnSetValueUnitPair("PageHeight",Grid.goContainer.sHeight);this._fnSetValueUnitPair("MarginTop",Grid.goMargins.sTop);
this._fnSetValueUnitPair("MarginRight",Grid.goMargins.sRight);this._fnSetValueUnitPair("MarginBottom",Grid.goMargins.sBottom);
this._fnSetValueUnitPair("MarginLeft",Grid.goMargins.sLeft);if(Grid.oGrids.iColumns!=null){this.nColCount.value=parseInt(Grid.oGrids.iColumns*10)/10
}else{this._fnSetValueUnitPair("ColWidth",Grid.oGrids.sColumnWidth)}if(Grid.oGrids.iRows!=null){this.nRowCount.value=parseInt(Grid.oGrids.iRows*10)/10
}else{this._fnSetValueUnitPair("RowHeight",Grid.oGrids.sRowHeight)}this.fnPopulateCalculated();
this._fnSetValueUnitPair("ColGutterWidth",Grid.oGrids.sGutterWidth);this._fnSetValueUnitPair("RowGutterHeight",Grid.oGrids.sGutterHeight)
};GridControl.fnPopulateCalculated=function(){if(Grid.oGrids.iColumns!=null){Grid.oGrids.iColumns!=0?this._fnSetValueUnitPair("ColWidth",Grid._oCalc.iColumnWidth+"px"):this.nColWidth.value="-"
}else{this.nColCount.value=parseInt(Grid._oCalc.iColumns*10)/10}if(Grid.oGrids.iRows!=null){Grid.oGrids.iRows!=0?this._fnSetValueUnitPair("RowHeight",Grid._oCalc.iRowHeight+"px"):this.nRowHeight.value="-"
}else{this.nRowCount.value=parseInt(Grid._oCalc.iRows*10)/10}};GridControl.fnPrintDisplay=function(){var c=document.getElementById("GridContainer");
var a=DesignCore.fnCreateBox({sId:"GridControl_Blocker",sTop:"0",sLeft:"0",sWidth:document.body.offsetWidth+"px",sHeight:document.body.offsetHeight+"px",sBackgroundColour:"white",iZIndex:34000});
var b=DesignCore.fnCreateBox({sId:"GridControl_BlockerInfo",sPosition:"fixed",sTop:"0",sLeft:"0",iZIndex:34001});
b.style.display="block";b.style.lineHeight="1.7em";b.innerHTML='Print / Screenshot view<br>Press "esc" to return to standard view<br>Press "space" to show/hide this message';
c.style.zIndex=34001;document.body.appendChild(a);document.body.appendChild(b);jsCore.addListener({mElement:document,sType:"keypress",fnCallback:this.fnPrintHide,oObj:this,mScope:true,sLabel:"GCEvent"})
};GridControl.fnPrintHide=function(b){if(b.preventDefault){b.preventDefault();b.stopPropagation()
}else{b.returnValue=false;b.cancelBubble=true}cKey=b.keyCode?b.keyCode:b.which;if(cKey==27){document.getElementById("GridContainer").style.zIndex=32101;
document.body.removeChild(document.getElementById("GridControl_Blocker"));document.body.removeChild(document.getElementById("GridControl_BlockerInfo"));
jsCore.removeListener({mElement:document,sType:"keypress",fnCallback:this.fnPrintHide})
}else{if(cKey==32){var a=document.getElementById("GridControl_BlockerInfo");a.style.display=="block"?a.style.display="none":a.style.display="block"
}}};GridControl._getElementFromEvent=function(a){var b;if(!a){var a=window.event}if(a==null){return null
}if(a.target){b=a.target}else{if(a.srcElement){b=a.srcElement}}if(b.nodeType==3){b=b.parentNode
}return(b)};GridControl._getPos=function(b){var a=0;var c=0;if(b.offsetParent){a=b.offsetLeft;
c=b.offsetTop;while(b=b.offsetParent){a+=b.offsetLeft;c+=b.offsetTop}}return{iLeft:a,iTop:c}
};GridControl._fnSetValueUnitPair=function(b,c){if(!c||c==""){c="0px"}var a=this.fnGetUnit(c);
document.getElementById("s"+b+"Unit").value=a;document.getElementById("io"+b+"Unit").innerHTML=a;
document.getElementById("io"+b).value=parseInt(this.fnGetValue(c)*10)/10};GridControl.fnGetValue=function(b){var a=new String(b);
if(a.match("%")){return a.slice(0,a.length-1)}else{return a.slice(0,a.length-2)}};
GridControl.fnGetUnit=function(b){var a=new String(b);if(a.match("%")){return"%"}else{return a.slice(a.length-2,a.length)
}};GridControl.fnSaveState=function(){var a={oContainer:Grid.goContainer,oMargins:Grid.goMargins,oGrid:Grid.oGrids,oColours:Grid.oColours,oPanel:this.oPanel};
DesignCore.fnCreateCookie("SpryMediaUK_Grid",escape(DesignCore.toJsonString(a)))};
GridControl.fnGetState=function(){try{var oObj=eval("("+unescape(DesignCore.fnReadCookie("SpryMediaUK_Grid"))+")");
return oObj}catch(err){return null}};GridControl.fnCreateHtml=function(){var h='		<div id="GridControl_DragHandle"></div>		<div id="GridControl_Fold" class="open"></div>		<div id="GridControl_Print"></div>		<div id="GridControl_Close"></div>				<div id="GridControl_Class" class="level1">			<div id="Page" class="level2">				<div id="Align" class="level3">					<div class="control_switcher control_switcher_open"></div>					<div class="level4">						<div class="level5">							<div class="split1">								Horizontal<br/>								<div id="horiz_align">									<div id="horiz_left" class="align_ip"></div>									<div id="horiz_center" class="align_ip"></div>									<div id="horiz_right" class="align_ip"></div>								</div>							</div>							<div class="split2">								Vertical<br/>								<div id="vert_align">									<div id="vert_top" class="align_ip"></div>									<div id="vert_center" class="align_ip"></div>									<div id="vert_bottom" class="align_ip"></div>								</div>							</div>							<div class="clear"></div>							<div class="level6"></div>						</div>					</div>				</div>								<div id="Size" class="level3">					<div class="control_switcher control_switcher_open"></div>					<div class="level4">						<div class="level5">							<div class="split1">Width</div>							<div class="split2">								<input type="text" value="" name="iPageWidth" id="ioPageWidth" />								<div class="select" id="ioPageWidthUnit"></div>								<input type="hidden" id="sPageWidthUnit" name="sPageWidthUnit" value="" />							</div>							<div class="split3">Colour</div>							<div id="PagePicker" class="split4 colour_picker">								<div class="colour c1"></div><div class="colour c2"></div><div class="colour c3"></div>								<div class="colour c4"></div><div class="colour c5"></div><div class="colour c6"></div>								<div class="colour c7"></div><div class="colour c8"></div><div class="colour c9"></div>								<div class="colour c10"></div><div class="colour c11"></div><div class="colour c12"></div>							</div>							<div class="clear"></div>														<div class="split1">Height</div>							<div class="split2">								<input type="text" value="" name="iPageHeight" id="ioPageHeight" />								<div class="select" id="ioPageHeightUnit"></div>								<input type="hidden" id="sPageHeightUnit" name="sPageHeightUnit" value="" />							</div>							<div class="clear"></div>							<div class="level6"></div>						</div>					</div>				</div>								<div id="Margin" class="level3">					<div class="control_switcher control_switcher_open"></div>					<div class="level4">						<div class="level5">							<div class="split1">Top</div>							<div class="split2">								<input type="text" value="" name="iMarginTop" id="ioMarginTop" />								<div class="select" id="ioMarginTopUnit"></div>								<input type="hidden" id="sMarginTopUnit" name="sMarginTopUnit" value="" />							</div>							<div class="split3">Colour</div>							<div id="MarginPicker" class="split4 colour_picker">								<div class="colour c1"></div><div class="colour c2"></div><div class="colour c3"></div>								<div class="colour c4"></div><div class="colour c5"></div><div class="colour c6"></div>								<div class="colour c7"></div><div class="colour c8"></div><div class="colour c9"></div>								<div class="colour c10"></div><div class="colour c11"></div><div class="colour c12"></div>							</div>							<div class="clear"></div>														<div class="split1">Right</div>							<div class="split2">								<input type="text" value="" name="iMarginRight" id="ioMarginRight" />								<div class="select" id="ioMarginRightUnit"></div>								<input type="hidden" id="sMarginRightUnit" name="sMarginRightUnit" value="" />							</div>							<div class="split3">Opacity</div>							<div class="split4">								<table cellpadding="0" cellspacing="0" border="0">									<tr>										<td class="slide0">0</td>										<td class="slide"><div class="slider_cont"><div id="MarginOpacity" class="slider"></div></div></td>										<td class="slide1">1</td>									</tr>								</table>							</div>							<div class="clear"></div>														<div class="split1">Bottom</div>							<div class="split2">								<input type="text" value="" name="iMarginBottom" id="ioMarginBottom" />								<div class="select" id="ioMarginBottomUnit"></div>								<input type="hidden" id="sMarginBottomUnit" name="sMarginBottomUnit" value="" />							</div>							<div class="clear"></div>														<div class="split1">Left</div>							<div class="split2">								<input type="text" value="" name="iMarginLeft" id="ioMarginLeft" />								<div class="select" id="ioMarginLeftUnit"></div>								<input type="hidden" id="sMarginLeftUnit" name="sMarginLeftUnit" value="" />							</div>							<div class="clear"></div>							<div class="level6"></div>						</div>					</div>				</div>			</div>									<div id="Lattice" class="level2">				<div id="Columns" class="level3">					<div class="control_switcher control_switcher_open"></div>					<div class="level4">						<div class="level5">							<div class="split1">Columns</div>							<div class="split2">								<input type="text" value="" name="iColCount" id="ioColCount" />								<div class="auto">Auto</div>							</div>							<div class="split3">Colour</div>							<div id="ColPicker" class="split4 colour_picker">								<div class="colour c1"></div><div class="colour c2"></div><div class="colour c3"></div>								<div class="colour c4"></div><div class="colour c5"></div><div class="colour c6"></div>								<div class="colour c7"></div><div class="colour c8"></div><div class="colour c9"></div>								<div class="colour c10"></div><div class="colour c11"></div><div class="colour c12"></div>							</div>							<div class="clear"></div>														<div class="split1">Column width</div>							<div class="split2">								<input type="text" value="" name="iColWidth" id="ioColWidth" />								<div class="select" id="ioColWidthUnit"></div>								<input type="hidden" id="sColWidthUnit" name="sColWidthUnit" value="" />								<div class="auto">Auto</div>							</div>							<div class="split3">Opacity</div>							<div class="split4">								<table cellpadding="0" cellspacing="0" border="0">									<tr>										<td class="slide0">0</td>										<td class="slide"><div class="slider_cont"><div id="ColOpacity" class="slider"></div></div></td>										<td class="slide1">1</td>									</tr>								</table>							</div>							<div class="clear"></div>							<div class="level6"></div>						</div>					</div>				</div>								<div id="Rows" class="level3">					<div class="control_switcher control_switcher_open"></div>					<div class="level4">						<div class="level5">							<div class="split1">Rows</div>							<div class="split2">								<input type="text" value="" name="iRowCount" id="ioRowCount" />								<div class="auto">Auto</div>							</div>							<div class="split3">Colour</div>							<div id="RowPicker" class="split4 colour_picker">								<div class="colour c1"></div><div class="colour c2"></div><div class="colour c3"></div>								<div class="colour c4"></div><div class="colour c5"></div><div class="colour c6"></div>								<div class="colour c7"></div><div class="colour c8"></div><div class="colour c9"></div>								<div class="colour c10"></div><div class="colour c11"></div><div class="colour c12"></div>							</div>							<div class="clear"></div>														<div class="split1">Row height</div>							<div class="split2">								<input type="text" value="" name="iRowHeight" id="ioRowHeight" />								<div class="select" id="ioRowHeightUnit"></div>								<input type="hidden" id="sRowHeightUnit" name="sRowHeightUnit" value="" />								<div class="auto">Auto</div>							</div>							<div class="split3">Opacity</div>							<div class="split4">								<table cellpadding="0" cellspacing="0" border="0">									<tr>										<td class="slide0">0</td>										<td class="slide"><div class="slider_cont"><div id="RowOpacity" class="slider"></div></div></td>										<td class="slide1">1</td>									</tr>								</table>							</div>							<div class="clear"></div>							<div class="level6"></div>						</div>					</div>				</div>			</div>									<div id="Gutter" class="level2">				<div id="Gutter2" class="level3">					<div class="control_switcher control_switcher_open"></div>					<div class="level4">						<div class="level5">							<div class="split1">Column gutter width</div>							<div class="split2">								<input type="text" value="" name="iColGutterWidth" id="ioColGutterWidth" />								<div class="select" id="ioColGutterWidthUnit"></div>								<input type="hidden" id="sColGutterWidthUnit" name="sColGutterWidthUnit" value="" />							</div>							<div class="split3">Colour</div>							<div id="GutterPicker" class="split4 colour_picker">								<div class="colour c1"></div><div class="colour c2"></div><div class="colour c3"></div>								<div class="colour c4"></div><div class="colour c5"></div><div class="colour c6"></div>								<div class="colour c7"></div><div class="colour c8"></div><div class="colour c9"></div>								<div class="colour c10"></div><div class="colour c11"></div><div class="colour c12"></div>							</div>							<div class="clear"></div>														<div class="split1">Row gutter height</div>							<div class="split2">								<input type="text" value="" name="iRowGutterHeight" id="ioRowGutterHeight" />								<div class="select" id="ioRowGutterHeightUnit"></div>								<input type="hidden" id="sRowGutterHeightUnit" name="sRowGutterHeightUnit" value="" />							</div>							<div class="split3">Opacity</div>							<div class="split4">								<table cellpadding="0" cellspacing="0" border="0">									<tr>										<td class="slide0">0</td>										<td class="slide"><div class="slider_cont"><div id="GutterOpacity" class="slider"></div></div></td>										<td class="slide1">1</td>									</tr>								</table>							</div>							<div class="clear"></div>							<div class="level6"></div>						</div>					</div>				</div>			</div>		</div>';
var g=DesignCore.fnCreateBox({sId:"GridControl",sClass:"SpryMedia_Design",sPosition:"fixed"});
g.innerHTML=h;document.body.appendChild(g);var a=document.createElement("div");a.setAttribute("id","GridControl_Select");
var f=document.createElement("div");var c=document.createElement("div");var e=document.createElement("div");
var d=document.createElement("div");f.setAttribute("id","px");c.setAttribute("id","%");
e.setAttribute("id","em");d.setAttribute("id","ex");f.className="selectOption";c.className="selectOption";
e.className="selectOption";d.className="selectOption";f.appendChild(document.createTextNode("px"));
c.appendChild(document.createTextNode("%"));e.appendChild(document.createTextNode("em"));
d.appendChild(document.createTextNode("ex"));a.appendChild(f);a.appendChild(c);a.appendChild(e);
a.appendChild(d);document.body.appendChild(a);var b=document.createElement("div");
b.setAttribute("id","GridControl_SelectBg");document.body.appendChild(b)};GridControl.fnIsNumeric=function(b){var c="0123456789.";
var a;for(i=0;i<b.length;i++){a=b.charAt(i);if(c.indexOf(a)==-1){return false}}return true
};GridControl.fnClose=function(a){if(typeof Design!="undefined"){document.getElementById("GridSwitch").className="level2";
Design.oState.bGrid=false;Design.fnSaveState()}var b=document.getElementsByTagName("body")[0];
this.nGridControl.style.display="none";jsCore.removeListener({sLabel:"GCEvent"});
this.nGridControl.innerHTML="";document.getElementById("GridContainer").innerHTML="";
document.getElementById("GridControl_Select").innerHTML="";document.getElementById("GridControl_SelectBg").innerHTML="";
b.removeChild(this.nGridControl);b.removeChild(document.getElementById("GridContainer"));
b.removeChild(document.getElementById("GridControl_Select"));b.removeChild(document.getElementById("GridControl_SelectBg"));
Grid=undefined;GridLoader=undefined;GridControl=undefined};GridControl.bAvailable=true;
GridControl.fnInitPanel();if(document.getElementById("LoadingGrid")){document.getElementById("LoadingGrid").parentNode.removeChild(document.getElementById("LoadingGrid"))
};