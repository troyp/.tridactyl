/*
 * Copyright 2007-2008 Allan Jardine. All rights reserved
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
if(typeof a.fOpacity!="undefined"){typeof b.style.filter=="string"?b.style.filter="alpha(opacity="+a.fOpacity*100+")":b.style.opacity=a.fOpacity
}return b},fnGetPos:function(b){var c=0;var a=0;if(b.offsetParent){c=b.offsetLeft;
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
c.push('"');return c;default:c.push(String(a));return c}}};if(typeof Rule!="undefined"){Rule=undefined
}var Rule={iRulerWidth:50,oState:{sBackgroundColour:"#000000",fOpacity:0.8,sColour:"#FFFFFF",fTickOpacity:1,bGuideDisplay:true,sGuideColor:"#00438A",fGuideOpacity:1,iOffsetX:0,iOffsetY:0,iSnapDistance:5,bSnap:true},aoGuides:new Array(),fnInit:function(){this.iBodyHeight=document.body.offsetHeight;
this.iBodyWidth=document.body.offsetWidth;this.iViewportHeight=document.documentElement.clientHeight;
this.iViewportWidth=document.documentElement.clientWidth;this.iContainerHeight=this.iViewportHeight>this.iBodyHeight?this.iViewportHeight:this.iBodyHeight;
this.fnGetSnapCoord();this.fnDrawHorizRuler();this.fnDrawVertRuler();this.fnDrawGuides();
RuleCrosshair.fnEnable();document.body.onselectstart=function(){return false
};jsCore.addListener({mElement:window,sType:"resize",fnCallback:function(){Rule.fnReInit.call(Rule)
},sLabel:"Rule"})},fnReInit:function(){this.iBodyHeight=document.body.offsetHeight;
this.iBodyWidth=document.body.offsetWidth;this.iViewportHeight=document.documentElement.clientHeight;
this.iViewportWidth=document.documentElement.clientWidth;this.iContainerHeight=this.iViewportHeight>this.iBodyHeight?this.iViewportHeight:this.iBodyHeight;
this.fnDrawHorizRuler();this.fnDrawVertRuler();this.fnDrawGuides();RuleCrosshair.fnDisable();
RuleCrosshair.fnEnable()},fnOriginChangeStart:function(a){RuleCrosshair.fnDisable();
RuleCrosshair.sMode="std";RuleCrosshair.fnEnable();jsCore.addListener({mElement:document,sType:"mouseup",fnCallback:this.fnOriginChangeEnd,oObj:this,mScope:true,sLabel:"Rule"})
},fnOriginChangeEnd:function(a){RuleCrosshair.fnDisable();RuleCrosshair.sMode="rule";
RuleCrosshair.fnEnable();jsCore.removeListener({mElement:document,sType:"mouseup",fnCallback:this.fnOriginChangeEnd});
this.oState.iOffsetX=DesignCore.fnPageX(a);this.oState.iOffsetY=DesignCore.fnPageY(a);
this.fnDrawHorizRuler();this.fnDrawVertRuler()},fnGetSnapCoord:function(){this.aSpanLevels=new Array(6);
this.aSpanLevels[0]=new Array();this.aSpanLevels[1]=new Array();this.aSpanLevels[2]=new Array();
this.aSpanLevels[3]=new Array();this.aSpanLevels[4]=new Array();this.aSpanLevels[5]=new Array();
var a;var b=this.fnGetBlockElements();for(var c=0;c<b.length;c++){iLevel=this.fnGetElementLevel(b[c]);
if(iLevel>5){continue}a=DesignCore.fnGetPos(b[c]);this.aSpanLevels[iLevel-1][this.aSpanLevels[iLevel-1].length++]={nNode:b[c],iSnapLeft:a[0],iSnapRight:a[0]+b[c].offsetWidth,iSnapTop:a[1],iSnapBottom:a[1]+b[c].offsetHeight,sId:b[c].getAttribute("id"),sNodeName:b[c].nodeName,sClassName:b[c].className}
}},fnGetElementLevel:function(b){var a=0;while(b.nodeName!="BODY"){b=b.parentNode;
a++}return a},fnGetBlockElements:function(e){var d="*";if(e==null){e=document.body
}var b=new Array();var a=e.getElementsByTagName(d);for(var f=0,c=a.length;f<c;f++){if(DesignCore.fnGetStyle(a[f],"display")){b.push(a[f])
}}return(b)},fnFindSnapX:function(g){var c;var f;var e=999999;var a;for(var d=0;d<this.aSpanLevels.length;
d++){for(var b=0;b<this.aSpanLevels[d].length;b++){if(Math.abs(g-this.aSpanLevels[d][b].iSnapLeft)<e){if(g==this.aSpanLevels[d][b].iSnapLeft){return{iSnap:this.aSpanLevels[d][b].iSnapLeft,iLevel:d,iElement:b}
}else{c=d;f=b;e=Math.abs(g-this.aSpanLevels[d][b].iSnapLeft);a=this.aSpanLevels[d][b].iSnapLeft
}}if(Math.abs(g-this.aSpanLevels[d][b].iSnapRight)<e){if(g==this.aSpanLevels[d][b].iSnapRight){return{iSnap:this.aSpanLevels[d][b].iSnapRight,iLevel:d,iElement:b}
}else{c=d;f=b;e=Math.abs(g-this.aSpanLevels[d][b].iSnapRight);a=this.aSpanLevels[d][b].iSnapRight
}}}}if(e<this.oState.iSnapDistance){return{iSnap:a,iLevel:c,iElement:f}}else{return{iSnap:-1}
}},fnFindSnapY:function(g){var c;var f;var e=999999;var a;for(var d=0;d<this.aSpanLevels.length;
d++){for(var b=0;b<this.aSpanLevels[d].length;b++){if(Math.abs(g-this.aSpanLevels[d][b].iSnapTop)<e){if(g==this.aSpanLevels[d][b].iSnapTop){return{iSnap:this.aSpanLevels[d][b].iSnapTop,iLevel:d,iElement:b}
}else{c=d;f=b;e=Math.abs(g-this.aSpanLevels[d][b].iSnapTop);a=this.aSpanLevels[d][b].iSnapTop
}}if(Math.abs(g-this.aSpanLevels[d][b].iSnapBottom)<e){if(g==this.aSpanLevels[d][b].iSnapBottom){return{iSnap:this.aSpanLevels[d][b].iSnapBottom,iLevel:d,iElement:b}
}else{c=d;f=b;e=Math.abs(g-this.aSpanLevels[d][b].iSnapBottom);a=this.aSpanLevels[d][b].iSnapBottom
}}}}if(e<this.oState.iSnapDistance){return{iSnap:a,iLevel:c,iElement:f}}else{return{iSnap:-1}
}},fnGuideNew:function(d,a){var c={};var b=jsCore.getElementFromEvent(d);if(b==this.nHorizRuler||b.parentNode==this.nHorizRuler){c.sOrient="horiz";
c.nNode=DesignCore.fnCreateBox({sTop:(d.clientY-2)+"px",sLeft:"0px",sHeight:"5px",sWidth:this.iBodyWidth+"px",iZIndex:32201});
c.nNode.appendChild(DesignCore.fnCreateBox({sTop:"2px",sLeft:"0px",sHeight:"1px",sWidth:this.iBodyWidth+"px",sBackgroundColour:this.oState.sGuideColor,fOpacity:this.oState.fGuideOpacity}))
}else{c.sOrient="vert";c.nNode=DesignCore.fnCreateBox({sTop:"0px",sLeft:(d.clientX-2)+"px",sHeight:this.iContainerHeight+"px",sWidth:"5px",iZIndex:32201});
c.nNode.appendChild(DesignCore.fnCreateBox({sTop:"0px",sLeft:"2px",sHeight:this.iContainerHeight+"px",sWidth:"1px",sBackgroundColour:this.oState.sGuideColor,fOpacity:this.oState.fGuideOpacity}))
}this.fnGuideAddMoveListeners();jsCore.addListener({mElement:c.nNode,sType:"mousedown",fnCallback:this.fnGuideStartMove,oObj:this,mScope:true,sLabel:"Rule"});
c.nNode.style.cursor="pointer";c.nNode.setAttribute("Count",this.aoGuides.length);
c.iCount=this.aoGuides.length;document.body.appendChild(c.nNode);this.aoGuides[this.aoGuides.length++]=c;
this.iSelectedGuide=this.aoGuides.length-1;if(!this.oState.bGuideDisplay){this.oState.bGuideDisplay=true;
this.fnDrawGuides();if(typeof RuleControl!="undefined"){RuleControl.fnDisplayGuideVisability()
}}},fnGuideAddMoveListeners:function(){jsCore.addListener({mElement:document,sType:"mousemove",fnCallback:this.fnGuideMove,oObj:this,mScope:true,sLabel:"Rule"});
jsCore.addListener({mElement:document,sType:"mouseup",fnCallback:this.fnGuideStopMove,oObj:this,mScope:true,sLabel:"Rule"});
this.nInfo=DesignCore.fnCreateBox({sTop:0,sLeft:0,sBackgroundColour:this.oState.sBackgroundColour,fOpacity:this.oState.fGuideOpacity,sPadding:"7px",iZIndex:32401});
this.nInfo.style.display="none";this.nInfo.style.fontSize="10px";this.nInfo.style.lineHeight="15px";
this.nInfo.style.fontFamily='"Lucida Grande", Verdana, Arial, Helvetica, sans-serif';
this.nInfo.style.textAlign="left";this.nInfo.style.color=this.oState.sColour;this.nInfo.style.MozBorderRadius="3px";
this.nInfo.style.WebkitBorderRadius="3px";this.nInfo.style.borderRadius="3px";this.nInfo.style.WebkitBoxShadow="5px 5px 5px rgba(0, 0, 0, 0.5)";
document.body.appendChild(this.nInfo);RuleCrosshair.fnDisable()},fnGuideStartMove:function(c){var a=jsCore.getElementFromEvent(c);
for(var b=0;b<this.aoGuides.length;b++){if(a.getAttribute("Count")==this.aoGuides[b].iCount||a.parentNode.getAttribute("Count")==this.aoGuides[b].iCount){this.fnGuideAddMoveListeners();
this.iSelectedGuide=b;return}}},fnGuideMove:function(d){var a;var c=this.aoGuides[this.iSelectedGuide];
var b;this.nInfo.style.display="block";if(c.sOrient=="horiz"){a=this.fnFindSnapY(DesignCore.fnPageY(d));
if(this.oState.bSnap==false||a.iSnap==-1){c.nNode.style.top=(DesignCore.fnPageY(d)-2)+"px";
this.nInfo.innerHTML="Y: "+(DesignCore.fnPageY(d)-this.oState.iOffsetY);this.aoGuides[this.iSelectedGuide].iPosition=DesignCore.fnPageY(d)
}else{c.nNode.style.top=(a.iSnap-2)+"px";b="Y: "+(a.iSnap-this.oState.iOffsetY);if(this.aSpanLevels[a.iLevel][a.iElement].sId!=null){b+="<br>ID: "+this.aSpanLevels[a.iLevel][a.iElement].sId
}b+="<br>Node: "+this.aSpanLevels[a.iLevel][a.iElement].sNodeName;if(this.aSpanLevels[a.iLevel][a.iElement].sClassName!=""){b+="<br>Class: "+this.aSpanLevels[a.iLevel][a.iElement].sClassName
}this.nInfo.innerHTML=b;this.aoGuides[this.iSelectedGuide].iPosition=a.iSnap}}else{a=this.fnFindSnapX(DesignCore.fnPageX(d));
if(this.oState.bSnap==false||a.iSnap==-1){c.nNode.style.left=(DesignCore.fnPageX(d)-2)+"px";
this.nInfo.innerHTML="X: "+(DesignCore.fnPageX(d)-this.oState.iOffsetX);this.aoGuides[this.iSelectedGuide].iPosition=DesignCore.fnPageX(d)
}else{c.nNode.style.left=(a.iSnap-2)+"px";b="X: "+(a.iSnap-this.oState.iOffsetX);
if(this.aSpanLevels[a.iLevel][a.iElement].sId!=null){b+="<br>ID: "+this.aSpanLevels[a.iLevel][a.iElement].sId
}b+="<br>Node: "+this.aSpanLevels[a.iLevel][a.iElement].sNodeName;if(this.aSpanLevels[a.iLevel][a.iElement].sClassName!=""){b+="<br>Class: "+this.aSpanLevels[a.iLevel][a.iElement].sClassName
}this.nInfo.innerHTML=b;this.aoGuides[this.iSelectedGuide].iPosition=a.iSnap}}this.nInfo.style.top=(DesignCore.fnPageY(d)+15)+"px";
this.nInfo.style.left=(DesignCore.fnPageX(d)+15)+"px"},fnGuideStopMove:function(b){var a=this.aoGuides[this.iSelectedGuide];
if(this.aoGuides[this.iSelectedGuide].sOrient=="horiz"){if(b.clientY<40){document.body.removeChild(a.nNode);
this.aoGuides.splice(this.iSelectedGuide,1)}}else{if(b.clientX<this.iRulerWidth){document.body.removeChild(a.nNode);
this.aoGuides.splice(this.iSelectedGuide,1)}}jsCore.removeListener({mElement:document,sType:"mousemove",fnCallback:this.fnGuideMove});
jsCore.removeListener({mElement:document,sType:"mouseup",fnCallback:this.fnGuideStopMove});
this.nInfo.parentNode.removeChild(this.nInfo);RuleCrosshair.fnEnable();RuleControl.fnSaveState()
},fnDrawHorizRuler:function(){var d;var a;if(typeof this.nHorizRuler!="undefined"){this.nHorizRuler.parentNode.removeChild(this.nHorizRuler)
}this.nHorizRuler=DesignCore.fnCreateBox({sId:"Rule_Horiz",sClass:"SpryMedia_Design",sPosition:"fixed",sTop:0,sLeft:this.iRulerWidth+"px",sHeight:"40px",sWidth:(this.iBodyWidth-this.iRulerWidth)+"px",iZIndex:32110,sColour:this.oState.sColour});
this.nHorizRuler.style.overflow="hidden";this.nHorizRuler.style.fontSize="11px";this.nHorizRuler.style.lineHeight="11px";
this.nHorizRuler.style.fontFamily='"Lucida Grande", Verdana, Arial, Helvetica, sans-serif';
this.nHorizRulerBackground=DesignCore.fnCreateBox({sTop:0,sLeft:0,sHeight:"100%",sWidth:"100%",sBackgroundColour:this.oState.sBackgroundColour,fOpacity:this.oState.fOpacity});
var c=DesignCore.fnCreateBox({sTop:0,sWidth:"1px",sHeight:"10px",sBackgroundColour:this.oState.sColour,fOpacity:this.oState.fTickOpacity});
document.body.appendChild(this.nHorizRuler);this.nHorizRuler.appendChild(this.nHorizRulerBackground);
for(var b=0;b<this.iBodyWidth-this.oState.iOffsetX;b+=10){this.fnDrawHorizMark(b,b-this.iRulerWidth,c)
}for(var b=0;b>this.oState.iOffsetX*-1;b-=10){this.fnDrawHorizMark(b,b-this.iRulerWidth,c)
}jsCore.addListener({mElement:this.nHorizRuler,sType:"mousedown",fnCallback:this.fnGuideNew,oObj:this,mScope:true,sLabel:"Rule"})
},fnDrawHorizMark:function(b,a,d){var c=d.cloneNode(false);c.style.left=(this.oState.iOffsetX+a)+"px";
if(b%100==0){c.style.height="20px";nLabel=DesignCore.fnCreateBox({sTop:"16px",sLeft:(this.oState.iOffsetX+a+4)+"px",fOpacity:this.oState.fTickOpacity});
nLabel.appendChild(document.createTextNode(b));this.nHorizRuler.appendChild(nLabel)
}else{if(b%50==0){c.style.height="15px"}}this.nHorizRuler.appendChild(c)},fnDrawVertRuler:function(){var d;
var a;if(typeof this.nVertRuler!="undefined"){this.nVertRuler.parentNode.removeChild(this.nVertRuler)
}this.nVertRuler=DesignCore.fnCreateBox({sId:"Rule_Vert",sClass:"SpryMedia_Design",sTop:0,sLeft:0,sHeight:this.iContainerHeight+"px",sWidth:this.iRulerWidth+"px",sColour:this.oState.sColour,iZIndex:32110});
this.nVertRuler.style.overflow="hidden";this.nVertRuler.style.fontSize="11px";this.nVertRuler.style.lineHeight="11px";
this.nVertRuler.style.fontFamily='"Lucida Grande", Verdana, Arial, Helvetica, sans-serif';
this.nVertRulerBackground=DesignCore.fnCreateBox({sTop:0,sLeft:0,sHeight:"100%",sWidth:"100%",sBackgroundColour:this.oState.sBackgroundColour,fOpacity:this.oState.fOpacity});
var c=DesignCore.fnCreateBox({sLeft:0,sHeight:"1px",sWidth:"10px",sBackgroundColour:this.oState.sColour,fOpacity:this.oState.fTickOpacity});
document.body.appendChild(this.nVertRuler);this.nVertRuler.appendChild(this.nVertRulerBackground);
for(var b=0;b<this.iContainerHeight-this.oState.iOffsetY;b+=10){this.fnDrawVertMark(b,c)
}for(var b=0;b>this.oState.iOffsetY*-1;b-=10){this.fnDrawVertMark(b,c)}jsCore.addListener({mElement:this.nVertRuler,sType:"mousedown",fnCallback:this.fnGuideNew,oObj:this,mScope:true,sLabel:"Rule"})
},fnDrawVertMark:function(a,c){var b=c.cloneNode(false);b.style.top=(this.oState.iOffsetY+a)+"px";
if(a%100==0){b.style.width="20px";nLabel=DesignCore.fnCreateBox({sTop:(this.oState.iOffsetY+a+4)+"px",sLeft:"16px",fOpacity:this.oState.fTickOpacity});
nLabel.appendChild(document.createTextNode(a));this.nVertRuler.appendChild(nLabel)
}else{if(a%50==0){b.style.width="15px"}}this.nVertRuler.appendChild(b)},fnDrawGuides:function(){for(var a=0;
a<this.aoGuides.length;a++){if(this.aoGuides[a].nNode&&this.aoGuides[a].nNode.nodeName){try{document.body.removeChild(this.aoGuides[a].nNode)
}catch(b){}}}if(this.oState.bGuideDisplay){for(var a=0;a<this.aoGuides.length;a++){if(this.aoGuides[a].sOrient=="horiz"){this.aoGuides[a].nNode=DesignCore.fnCreateBox({sTop:(this.aoGuides[a].iPosition-2)+"px",sLeft:"0px",sHeight:"5px",sWidth:this.iBodyWidth+"px",iZIndex:32201});
this.aoGuides[a].nNode.appendChild(DesignCore.fnCreateBox({sTop:"2px",sLeft:"0px",sHeight:"1px",sWidth:this.iBodyWidth+"px",sBackgroundColour:this.oState.sGuideColor,fOpacity:this.oState.fGuideOpacity}))
}else{this.aoGuides[a].nNode=DesignCore.fnCreateBox({sTop:"0px",sLeft:(this.aoGuides[a].iPosition-2)+"px",sHeight:this.iContainerHeight+"px",sWidth:"5px",iZIndex:32201});
this.aoGuides[a].nNode.appendChild(DesignCore.fnCreateBox({sTop:"0px",sLeft:"2px",sHeight:this.iContainerHeight+"px",sWidth:"1px",sBackgroundColour:this.oState.sGuideColor,fOpacity:this.oState.fGuideOpacity}))
}jsCore.addListener({mElement:this.aoGuides[a].nNode,sType:"mousedown",fnCallback:this.fnGuideStartMove,oObj:this,mScope:true,sLabel:"Rule"});
this.aoGuides[a].iCount=a+1;this.aoGuides[a].nNode.style.cursor="pointer";this.aoGuides[a].nNode.setAttribute("Count",a+1);
document.body.appendChild(this.aoGuides[a].nNode)}}}};if(typeof RuleCrosshair!="undefined"){RuleCrosshair=undefined
}var RuleCrosshair={};RuleCrosshair.oBoxes={oTop:{sBackgroundColour:"black",fOpacity:1},oRight:{sBackgroundColour:"black",fOpacity:1},oBottom:{sBackgroundColour:"black",fOpacity:1},oLeft:{sBackgroundColour:"black",fOpacity:1},iZIndex:1020};
RuleCrosshair.iCursorSpacing=0;RuleCrosshair.sMode="rule";RuleCrosshair.fnDisable=function(){jsCore.removeListener({mElement:document,sType:"mousemove",fnCallback:this.fnMouseMove});
if(this.sMode=="std"){document.body.removeChild(this.nCHContainer)}else{this.nTop.parentNode.removeChild(this.nTop);
this.nLeft.parentNode.removeChild(this.nLeft)}};RuleCrosshair.fnEnable=function(){this.iBodyHeight=document.body.offsetHeight;
this.iBodyWidth=document.body.offsetWidth;this.iViewportHeight=document.documentElement.clientHeight;
this.iViewportWidth=document.documentElement.clientWidth;this.iContainerHeight=this.iViewportHeight>this.iBodyHeight?this.iViewportHeight:this.iBodyHeight;
if(this.sMode=="std"){this.nCHContainer=DesignCore.fnCreateBox({sTop:0,sLeft:0,sHeight:this.iContainerHeight+"px",sWidth:this.iBodyWidth+"px",iZIndex:this.oBoxes.iZIndex});
this.nTop=DesignCore.fnCreateBox({sTop:0,sLeft:0,sHeight:"1px",sWidth:"1px",sBackgroundColour:this.oBoxes.oTop.sBackgroundColour,fOpacity:this.oBoxes.oTop.fOpacity});
this.nLeft=DesignCore.fnCreateBox({sTop:0,sLeft:0,sHeight:"1px",sWidth:"1px",sBackgroundColour:this.oBoxes.oLeft.sBackgroundColour,fOpacity:this.oBoxes.oLeft.fOpacity});
this.nBottom=DesignCore.fnCreateBox({sBottom:0,sLeft:0,sHeight:"1px",sWidth:"1px",sBackgroundColour:this.oBoxes.oBottom.sBackgroundColour,fOpacity:this.oBoxes.oBottom.fOpacity});
this.nRight=DesignCore.fnCreateBox({sTop:0,sRight:0,sHeight:"1px",sWidth:"1px",sBackgroundColour:this.oBoxes.oRight.sBackgroundColour,fOpacity:this.oBoxes.oRight.fOpacity});
this.nInfo=DesignCore.fnCreateBox({sId:"CH_info",sTop:0,sLeft:0,sHeight:"10px",sWidth:"80px",sPadding:"5px",iZIndex:32401,fOpacity:0.8});
this.nInfo.style.fontSize="10px";this.nInfo.style.lineHeight="10px";this.nInfo.style.fontFamily='"Lucida Grande", Verdana, Arial, Helvetica, sans-serif';
this.nInfo.style.textAlign="center";this.nInfo.style.backgroundColor="black";this.nInfo.style.color="white";
this.nInfo.style.visibility="hidden";this.nInfo.style.MozBorderRadius="3px";this.nInfo.style.WebkitBorderRadius="3px";
this.nInfo.style.borderRadius="3px";this.nInfo.style.WebkitBoxShadow="5px 5px 5px rgba(0, 0, 0, 0.5)"
}else{this.nTop=DesignCore.fnCreateBox({sPosition:"fixed",sTop:0,sLeft:0,sHeight:"1px",sWidth:"1px",sBackgroundColour:Rule.oState.sColour,fOpacity:0.5,iZIndex:32202});
this.nLeft=DesignCore.fnCreateBox({sTop:0,sLeft:0,sHeight:"1px",sWidth:"1px",sBackgroundColour:Rule.oState.sColour,fOpacity:0.5,iZIndex:32202})
}if(this.sMode=="std"){document.body.insertBefore(this.nCHContainer,document.body.childNodes[0]);
this.nCHContainer.appendChild(this.nTop);this.nCHContainer.appendChild(this.nLeft);
this.nCHContainer.appendChild(this.nBottom);this.nCHContainer.appendChild(this.nRight);
this.nCHContainer.appendChild(this.nInfo)}else{document.body.insertBefore(this.nTop,document.body.childNodes[0]);
document.body.insertBefore(this.nLeft,document.body.childNodes[0])}jsCore.addListener({mElement:document,sType:"mousemove",fnCallback:this.fnMouseMove,oObj:this,mScope:true,sLabel:"Rule"})
};RuleCrosshair.fnMouseMove=function(a){if(this.sMode=="std"){this.nTop.style.left=DesignCore.fnPageX(a)+"px";
this.nTop.style.height=(DesignCore.fnPageY(a)-this.iCursorSpacing)+"px";this.nLeft.style.top=DesignCore.fnPageY(a)+"px";
this.nLeft.style.width=(DesignCore.fnPageX(a)-this.iCursorSpacing)+"px";this.nBottom.style.left=DesignCore.fnPageX(a)+"px";
this.nBottom.style.height=(this.iContainerHeight-DesignCore.fnPageY(a)-this.iCursorSpacing)+"px";
this.nRight.style.top=DesignCore.fnPageY(a)+"px";this.nRight.style.width=(this.iBodyWidth-DesignCore.fnPageX(a)-this.iCursorSpacing)+"px";
this.nInfo.style.visibility="visible";this.nInfo.style.top=document.documentElement.scrollTop+this.iViewportHeight<DesignCore.fnPageY(a)+30+15?(DesignCore.fnPageY(a)-20-15)+"px":this.nInfo.style.top=(DesignCore.fnPageY(a)+15)+"px";
this.nInfo.style.left=document.documentElement.scrollLeft+this.iViewportWidth<DesignCore.fnPageX(a)+100+15?this.nInfo.style.left=(DesignCore.fnPageX(a)-90-15)+"px":this.nInfo.style.left=(DesignCore.fnPageX(a)+15)+"px";
this.nInfo.innerHTML="x: "+(DesignCore.fnPageX(a)-Rule.oState.iOffsetX)+" y: "+(DesignCore.fnPageY(a)-Rule.oState.iOffsetY)
}else{this.nTop.style.left=DesignCore.fnPageX(a)+"px";this.nTop.style.height="50px";
this.nLeft.style.top=DesignCore.fnPageY(a)+"px";this.nLeft.style.width="50px"}};if(typeof RuleControl!="undefined"){RuleControl=undefined
}var RuleControl={_oDrag:{nTarget:null,iNodeStartX:null,iNodeStartY:null,iMouseStartX:null,iMouseStartY:null},bOpen:false,fnInit:function(){var a=this.fnGetState();
if(a!=null&&a.RuleState!=null){Rule.oState=a.RuleState}if(a!=null&&a.GuideState!=null){Rule.aoGuides=a.GuideState
}Rule.fnInit();this.fnDrawHtml();if(a!=null){if(a.ControlState){this.bOpen=true;document.getElementById("RuleControl_ShowHide").className="RuleControl_Show";
document.getElementById("RuleControl_Container").style.display="block"}else{this.bOpen=false
}}jsCore.addListener({mElement:DesignCore.fnGetElementsByClassName("colour_picker","div",document.getElementById("GridControl")),sType:"click",fnCallback:this.fnSetColour,oObj:this,mScope:true,sLabel:"Rule"});
jsCore.addListener({mElement:document,sType:"mousedown",fnCallback:this.fnMouseSelect,oObj:this,mScope:true,sLabel:"Rule"});
jsCore.addListener({mElement:document.getElementById("RuleControl_Origin"),sType:"mousedown",fnCallback:Rule.fnOriginChangeStart,oObj:Rule,mScope:Rule,sLabel:"Rule"});
jsCore.addListener({mElement:document.getElementById("RuleControl_ShowHide"),sType:"click",fnCallback:this.fnShowHide,oObj:this,mScope:true,sLabel:"Rule"});
jsCore.addListener({mElement:document.getElementById("RuleControl_Close"),sType:"click",fnCallback:this.fnCloseRule,oObj:this,mScope:true,sLabel:"Rule"});
this.fnDisplayColours();this.fnDisplayOpacity();this.fnDisplaySnap();this.fnDisplayGuideVisability()
},fnDraw:function(){this.fnSaveState();Rule.fnReInit()},fnCloseRule:function(){if(typeof Design!="undefined"){document.getElementById("RuleSwitch").className="level2";
Design.oState.bRule=false;Design.fnSaveState()}jsCore.removeListener({sLabel:"Rule"});
if(RuleCrosshair.sMode=="std"){document.body.removeChild(RuleCrosshair.nTop);document.body.removeChild(RuleCrosshair.nLeft);
document.body.removeChild(RuleCrosshair.nRight);document.body.removeChild(RuleCrosshair.nBottom)
}else{document.body.removeChild(RuleCrosshair.nTop);document.body.removeChild(RuleCrosshair.nLeft)
}for(var a=0;a<Rule.aoGuides.length;a++){document.body.removeChild(Rule.aoGuides[a].nNode)
}Rule.nHorizRuler.parentNode.removeChild(Rule.nHorizRuler);Rule.nVertRuler.parentNode.removeChild(Rule.nVertRuler);
this.nRuleControlContainer.parentNode.removeChild(this.nRuleControlContainer);document.body.removeChild(document.getElementById("RuleControl_Origin"));
document.body.removeChild(document.getElementById("RuleControl_ShowHide"));document.body.removeChild(document.getElementById("RuleControl_Close"));
RuleCrosshair=undefined;Rule=undefined;RuleControl=undefined},fnShowHide:function(){if(this.bOpen){this.bOpen=false;
document.getElementById("RuleControl_ShowHide").className="RuleControl_Hide";document.getElementById("RuleControl_Container").style.display="none"
}else{this.bOpen=true;document.getElementById("RuleControl_ShowHide").className="RuleControl_Show";
document.getElementById("RuleControl_Container").style.display="block";this.fnDisplayColours();
this.fnDisplayOpacity();this.fnDisplaySnap()}this.fnSaveState()},fnDisplaySnap:function(){var a=document.getElementById("ioGridControl_Snap");
a.innerHTML=Rule.oState.bSnap?"Enabled":"Disabled"},fnDisplayGuideVisability:function(){var a=document.getElementById("ioGridControl_Display");
a.innerHTML=Rule.oState.bGuideDisplay?"Hide all":"Show all"},fnDisplayOpacity:function(){DesignCore.fnSetSliderValue(document.getElementById("TintOpacity"),Rule.oState.fOpacity);
DesignCore.fnSetSliderValue(document.getElementById("TickOpacity"),Rule.oState.fTickOpacity);
DesignCore.fnSetSliderValue(document.getElementById("SnapDistance"),Rule.oState.iSnapDistance/10);
DesignCore.fnSetSliderValue(document.getElementById("ColourOpacity"),Rule.oState.fGuideOpacity)
},fnDisplayColours:function(){var a=DesignCore.fnGetElementsByClassName("colour_picker","div",document.getElementById("RuleControl"));
DesignCore.fnSetSelectColourDisplay(Rule.oState.sBackgroundColour,a[0]);DesignCore.fnSetSelectColourDisplay(Rule.oState.sColour,a[1]);
DesignCore.fnSetSelectColourDisplay(Rule.oState.sGuideColor,a[2])},fnDrawHtml:function(){this.nRuleControlContainer=DesignCore.fnCreateBox({sId:"RuleControl_Container",sClass:"SpryMedia_Design",sPosition:"fixed"});
var c=DesignCore.fnCreateBox({sId:"RuleControl_Origin",sPosition:"fixed",iZIndex:32401});
var a=DesignCore.fnCreateBox({sId:"RuleControl_ShowHide",sPosition:"fixed",iZIndex:32401});
a.className="RuleControl_Hide";var d=DesignCore.fnCreateBox({sId:"RuleControl_Close",sPosition:"fixed",iZIndex:32401});
document.body.insertBefore(c,document.body.childNodes[0]);document.body.insertBefore(d,document.body.childNodes[0]);
document.body.insertBefore(a,document.body.childNodes[0]);document.body.insertBefore(this.nRuleControlContainer,document.body.childNodes[0]);
var f='			<div class="level1">				<div id="RuleControl_Ruler" class="level2">					<div id="RuleControl_Background" class="level3">						<div class="level4">							<div class="level5">								<div class="split1">Colour</div>								<div id="RulerColour" class="split2 colour_picker">									<div class="colour c1"></div><div class="colour c2"></div><div class="colour c3"></div>									<div class="colour c4"></div><div class="colour c5"></div><div class="colour c6"></div>									<div class="colour c7"></div><div class="colour c8"></div><div class="colour c9"></div>									<div class="colour c10"></div><div class="colour c11"></div><div class="colour c12"></div>								</div>								<div class="clear"></div>																<div class="split1">Opacity</div>								<div class="split2">									<table cellpadding="0" cellspacing="0" border="0">										<tr>											<td class="slide0">0</td>											<td class="slide"><div class="slider_cont"><div id="TintOpacity" class="slider"></div></div></td>											<td class="slide1">1</td>										</tr>									</table>								</div>								<div class="clear"></div>								<div class="level6"></div>							</div>						</div>					</div>															<div id="RuleControl_Ticks" class="level3">						<div class="level4">							<div class="level5">								<div class="split1">Colour</div>								<div id="TicksColour" class="split2 colour_picker">									<div class="colour c1"></div><div class="colour c2"></div><div class="colour c3"></div>									<div class="colour c4"></div><div class="colour c5"></div><div class="colour c6"></div>									<div class="colour c7"></div><div class="colour c8"></div><div class="colour c9"></div>									<div class="colour c10"></div><div class="colour c11"></div><div class="colour c12"></div>								</div>								<div class="clear"></div>																<div class="split1">Opacity</div>								<div class="split2">									<table cellpadding="0" cellspacing="0" border="0">										<tr>											<td class="slide0">0</td>											<td class="slide"><div class="slider_cont"><div id="TickOpacity" class="slider"></div></div></td>											<td class="slide1">1</td>										</tr>									</table>								</div>								<div class="clear"></div>								<div class="level6"></div>							</div>						</div>					</div>				</div>																				<div id="RuleControl_Guides" class="level2">					<div id="RuleControl_Snap" class="level3">						<div class="level4">							<div class="level5">								<div class="split1">Snap</div>								<div class="split2">									<div class="boolIndicator" id="ioGridControl_Snap"></div>								</div>								<div class="clear"></div>																<div class="split1">Snap distance</div>								<div class="split2">									<table cellpadding="0" cellspacing="0" border="0">										<tr>											<td class="slide0">1</td>											<td class="slide"><div class="slider_cont"><div id="SnapDistance" class="slider"></div></div></td>											<td class="slide1">10</td>										</tr>									</table>								</div>								<div class="clear"></div>								<div class="level6"></div>							</div>						</div>					</div>															<div id="RuleControl_GuideColour" class="level3">						<div class="level4">							<div class="level5">								<div class="split1">Colour</div>								<div id="GuideColour" class="split2 colour_picker">									<div class="colour c1"></div><div class="colour c2"></div><div class="colour c3"></div>									<div class="colour c4"></div><div class="colour c5"></div><div class="colour c6"></div>									<div class="colour c7"></div><div class="colour c8"></div><div class="colour c9"></div>									<div class="colour c10"></div><div class="colour c11"></div><div class="colour c12"></div>								</div>								<div class="clear"></div>																<div class="split1">Opacity</div>								<div class="split2">									<table cellpadding="0" cellspacing="0" border="0">										<tr>											<td class="slide0">0</td>											<td class="slide"><div class="slider_cont"><div id="ColourOpacity" class="slider"></div></div></td>											<td class="slide1">1</td>										</tr>									</table>								</div>								<div class="clear"></div>								<div class="level6"></div>							</div>						</div>					</div>															<div id="RuleControl_GuideControl" class="level3">						<div class="level4">							<div class="level5">								<div class="split1">Display</div>								<div id="GuideDisplay" class="split2">									<div class="boolIndicator" id="ioGridControl_Display"></div>								</div>								<div class="clear"></div>																<div class="split1">Clear</div>								<div class="split2">									<div class="boolIndicator" id="ioGridControl_Clear">Delete all guides</div>								</div>								<div class="clear"></div>								<div class="level6"></div>							</div>						</div>					</div>				</div>			</div>';
this.nRuleControlContainer.innerHTML=f;if(navigator.userAgent.indexOf("WebKit")!=-1){var e=RegExp("( AppleWebKit/)([^.+ ]+)").exec(navigator.userAgent);
var b=e[2].split(".")[0]*1;if(b<523){this.nRuleControlContainer.style.position="absolute"
}}},fnMouseMove:function(a){var b;if(this._oDrag.nTarget.className=="slider"){b=this._oDrag.iNodeStartX+a.clientX-this._oDrag.iMouseStartX;
if(b>0&&b<this._oDrag.nTarget.parentNode.offsetWidth-this._oDrag.nTarget.offsetWidth){this._oDrag.nTarget.style.left=b+"px"
}else{if(b<=0){this._oDrag.nTarget.style.left="0px"}else{this._oDrag.nTarget.style.left=(this._oDrag.nTarget.parentNode.offsetWidth-this._oDrag.nTarget.offsetWidth)+"px"
}}}},fnMouseSelect:function(b){var c=DesignCore.fnGetElementFromEvent(b);if(c.getAttribute("id")=="ioGridControl_Snap"){Rule.oState.bSnap=Rule.oState.bSnap?false:true;
this.fnDisplaySnap();this.fnSaveState()}else{if(c.getAttribute("id")=="ioGridControl_Display"){Rule.oState.bGuideDisplay=Rule.oState.bGuideDisplay?false:true;
Rule.fnDrawGuides();this.fnDisplayGuideVisability();this.fnSaveState()}else{if(c.getAttribute("id")=="ioGridControl_Clear"){for(var a=0;
a<Rule.aoGuides.length;a++){document.body.removeChild(Rule.aoGuides[a].nNode)}Rule.aoGuides.splice(0,Rule.aoGuides.length);
this.fnSaveState()}else{if(c.className=="slider"){this._oDrag.nTarget=c;this._oDrag.iNodeStartX=this._oDrag.nTarget.offsetLeft;
this._oDrag.iMouseStartX=b.clientX;jsCore.addListener({mElement:document,sType:"mouseup",fnCallback:this.fnMouseRelease,oObj:this,mScope:true,sLabel:"Rule"});
jsCore.addListener({mElement:document,sType:"mousemove",fnCallback:this.fnMouseMove,oObj:this,mScope:true,sLabel:"Rule"})
}}}}},fnMouseRelease:function(a){jsCore.removeListener({mElement:document,sType:"mouseup",fnCallback:this.fnMouseRelease});
jsCore.removeListener({mElement:document,sType:"mousemove",fnCallback:this.fnMouseMove});
if(this._oDrag.nTarget){if(this._oDrag.nTarget&&this._oDrag.nTarget.className=="slider"){switch(this._oDrag.nTarget.getAttribute("id")){case"TintOpacity":Rule.oState.fOpacity=DesignCore.fnGetSliderValue(this._oDrag.nTarget);
typeof Rule.nVertRulerBackground.filter=="string"?Rule.nVertRulerBackground.filter="alpha(opacity="+Rule.oState.fOpacity*100+")":Rule.nVertRulerBackground.style.opacity=Rule.oState.fOpacity;
typeof Rule.nHorizRulerBackground.filter=="string"?Rule.nHorizRulerBackground.filter="alpha(opacity="+Rule.oState.fOpacity*100+")":Rule.nHorizRulerBackground.style.opacity=Rule.oState.fOpacity;
break;case"TickOpacity":Rule.oState.fTickOpacity=DesignCore.fnGetSliderValue(this._oDrag.nTarget);
this.fnDraw();break;case"SnapDistance":Rule.oState.iSnapDistance=DesignCore.fnGetSliderValue(this._oDrag.nTarget)*10;
break;case"ColourOpacity":Rule.oState.fGuideOpacity=DesignCore.fnGetSliderValue(this._oDrag.nTarget);
Rule.fnDrawGuides();break}}}},fnSetColour:function(b){var c=DesignCore.fnGetElementFromEvent(b);
var a;c.currentStyle?a=c.currentStyle.backgroundColor:a=document.defaultView.getComputedStyle(c,null).getPropertyValue("background-color");
switch(c.parentNode.getAttribute("id")){case"RulerColour":Rule.oState.sBackgroundColour=a;
Rule.nVertRulerBackground.style.backgroundColor=a;Rule.nHorizRulerBackground.style.backgroundColor=a;
this.fnSaveState();break;case"TicksColour":Rule.oState.sColour=a;this.fnDraw();break;
case"GuideColour":Rule.oState.sGuideColor=a;this.fnDraw();break;default:break}this.fnDisplayColours()
},fnSaveState:function(){var c=new Array();for(var b=0;b<Rule.aoGuides.length;b++){c[b]={sOrient:Rule.aoGuides[b].sOrient,iPosition:Rule.aoGuides[b].iPosition}
}var a={RuleState:Rule.oState,GuideState:c,ControlState:this.bOpen};DesignCore.fnCreateCookie("SpryMediaUK_Rule",DesignCore.toJsonString(a))
},fnGetState:function(){try{var oObj=eval("("+DesignCore.fnReadCookie("SpryMediaUK_Rule")+")");
return oObj}catch(err){return null}}};RuleControl.fnInit();if(document.getElementById("LoadingRule")){document.getElementById("LoadingRule").parentNode.removeChild(document.getElementById("LoadingRule"))
};