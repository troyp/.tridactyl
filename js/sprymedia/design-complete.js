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
c.push('"');return c;default:c.push(String(a));return c}}};if(typeof Design!="undefined"){Design=undefined
}var Design={sDesignUrl:"//www.sprymedia.co.uk/design",sComponentJsDir:"/media/js",sComponentCssDir:"/media/css",oState:{sX:null,sY:null,bGrid:false,bUnit:false,bRule:false,bCrosshair:false},_oDrag:{nTarget:null,iNodeStartX:null,iNodeStartY:null,iMouseStartX:null,iMouseStartY:null},fnInit:function(){var a=this.fnGetState();
if(a!=null){this.oState=a}this.fnDrawHtml();jsCore.addListener({mElement:document.getElementById("GridSwitch"),sType:"click",fnCallback:this.fnGridSwitch,oObj:this,mScope:true,sLabel:"Design"});
jsCore.addListener({mElement:document.getElementById("RuleSwitch"),sType:"click",fnCallback:this.fnRuleSwitch,oObj:this,mScope:true,sLabel:"Design"});
jsCore.addListener({mElement:document.getElementById("UnitSwitch"),sType:"click",fnCallback:this.fnUnitSwitch,oObj:this,mScope:true,sLabel:"Design"});
jsCore.addListener({mElement:document.getElementById("CrosshairSwitch"),sType:"click",fnCallback:this.fnCrosshairSwitch,oObj:this,mScope:true,sLabel:"Design"});
jsCore.addListener({mElement:document.getElementById("SpryMediaDesign_Close"),sType:"click",fnCallback:this.fnClose,oObj:this,mScope:true,sLabel:"Design"});
jsCore.addListener({mElement:document.getElementById("SpryMediaDesign_DragHandle"),sType:"mousedown",fnCallback:this.fnMouseClick,oObj:this,mScope:true,sLabel:"Design"});
if(this.oState.bGrid){this.fnGridSwitch()}if(this.oState.bRule){this.fnRuleSwitch()
}if(this.oState.bUnit){this.fnUnitSwitch()}if(this.oState.bCrosshair){this.fnCrosshairSwitch()
}},fnClose:function(a){if(typeof Grid!="undefined"){GridControl.fnClose()}if(typeof Rule!="undefined"){RuleControl.fnCloseRule()
}if(typeof Unit!="undefined"){Unit.fnClose()}if(typeof Crosshair!="undefined"){Crosshair.fnDisable()
}jsCore.removeListener({sLabel:"Design"});document.body.removeChild(this.nInfo);Design=undefined;
DesignCore=undefined},fnGridSwitch:function(){if(typeof Grid=="undefined"){this.oState.bGrid=true;
document.getElementById("GridSwitch").className="level2 active";this.fnLoadingIndicator("Loading Grid...","LoadingGrid");
DesignLoader.fnLoadFile(this.sDesignUrl+"/grid"+this.sComponentCssDir+"/grid.css","css");
DesignLoader.fnLoadFile(this.sDesignUrl+"/grid"+this.sComponentJsDir+"/grid-component.js","js")
}else{this.oState.bGrid=false;document.getElementById("GridSwitch").className="level2";
GridControl.fnClose()}this.fnSaveState()},fnRuleSwitch:function(){if(typeof Rule=="undefined"){this.oState.bRule=true;
document.getElementById("RuleSwitch").className="level2 active";this.fnLoadingIndicator("Loading Rule...","LoadingRule");
DesignLoader.fnLoadFile(this.sDesignUrl+"/rule"+this.sComponentCssDir+"/rule.css","css");
DesignLoader.fnLoadFile(this.sDesignUrl+"/rule"+this.sComponentJsDir+"/rule-component.js","js")
}else{this.oState.bRule=false;document.getElementById("RuleSwitch").className="level2";
RuleControl.fnCloseRule()}this.fnSaveState()},fnUnitSwitch:function(){if(typeof Unit=="undefined"){this.oState.bUnit=true;
document.getElementById("UnitSwitch").className="level2 active";this.fnLoadingIndicator("Loading Unit...","LoadingUnit");
DesignLoader.fnLoadFile(this.sDesignUrl+"/unit"+this.sComponentCssDir+"/unit.css","css");
if(/msie/i.test(navigator.userAgent)&&!/opera/i.test(navigator.userAgent)){DesignLoader.fnLoadFile(this.sDesignUrl+"/unit"+this.sComponentJsDir+"/excanvas.js","js")
}DesignLoader.fnLoadFile(this.sDesignUrl+"/unit"+this.sComponentJsDir+"/unit-component.js","js")
}else{this.oState.bUnit=false;document.getElementById("UnitSwitch").className="level2";
Unit.fnClose()}this.fnSaveState()},fnCrosshairSwitch:function(){if(typeof Crosshair=="undefined"){this.oState.bCrosshair=true;
document.getElementById("CrosshairSwitch").className="level2 active";this.fnLoadingIndicator("Loading Crosshair...","LoadingCrosshair");
DesignLoader.fnLoadFile(this.sDesignUrl+"/crosshair"+this.sComponentJsDir+"/crosshair-component.js","js")
}else{this.oState.bCrosshair=false;document.getElementById("CrosshairSwitch").className="level2";
Crosshair.fnClose()}this.fnSaveState()},fnDrawHtml:function(){this.nInfo=DesignCore.fnCreateBox({sId:"SpryMediaDesign",sClass:"SpryMedia_Design",sPosition:"fixed"});
this.oState.sY==null?this.nInfo.style.bottom=0:this.nInfo.style.top=this.oState.sY;
this.oState.sX==null?this.nInfo.style.right=0:this.nInfo.style.left=this.oState.sX;
document.body.insertBefore(this.nInfo,document.body.childNodes[0]);var c='			<div id="SpryMediaDesign_DragHandle"></div>			<div id="SpryMediaDesign_Close"></div>			<div class="level1">				<div id="GridSwitch" class="level2">Grid</div>				<div id="RuleSwitch" class="level2">Rule</div>				<div id="UnitSwitch" class="level2">Unit</div>				<div id="CrosshairSwitch" class="level2">Crosshair</div>				<div class="clear"></div>			</div>			<div id="SpryMediaDesign_About" class="level1">				&nbsp;<a href="//www.sprymedia.co.uk/article/Design" target="_blank">About <i>Design</i></a></div>';
if(navigator.userAgent.indexOf("WebKit")!=-1){var b=RegExp("( AppleWebKit/)([^.+ ]+)").exec(navigator.userAgent);
var a=b[2].split(".")[0]*1;if(a<523){this.nInfo.style.position="absolute"}}this.nInfo.innerHTML=c;
this.nLoadingIndicator=DesignCore.fnCreateBox({sId:"SpryMediaDesignIndicator",sPosition:"fixed"});
document.body.insertBefore(this.nLoadingIndicator,document.body.childNodes[0])},fnLoadingIndicator:function(c,b){var a=DesignCore.fnCreateBox({sPosition:"relative",sId:b});
a.appendChild(document.createTextNode(c));this.nLoadingIndicator.appendChild(a)},fnMouseClick:function(a){this._oDrag.nTarget=this.nInfo;
this._oDrag.iNodeStartX=this._oDrag.nTarget.offsetLeft;this._oDrag.iNodeStartY=this._oDrag.nTarget.offsetTop;
this._oDrag.iMouseStartX=a.clientX;this._oDrag.iMouseStartY=a.clientY;jsCore.addListener({mElement:document,sType:"mouseup",fnCallback:this.fnMouseRelease,oObj:this,mScope:true,sLabel:"Design"});
jsCore.addListener({mElement:document,sType:"mousemove",fnCallback:this.fnMouseMove,oObj:this,mScope:true,sLabel:"Design"})
},fnMouseMove:function(a){this._oDrag.nTarget.style.left=(this._oDrag.iNodeStartX+a.clientX-this._oDrag.iMouseStartX)+"px";
this._oDrag.nTarget.style.top=(this._oDrag.iNodeStartY+a.clientY-this._oDrag.iMouseStartY)+"px"
},fnMouseRelease:function(a){jsCore.removeListener({mElement:document,sType:"mouseup",fnCallback:this.fnMouseRelease});
jsCore.removeListener({mElement:document,sType:"mousemove",fnCallback:this.fnMouseMove});
this.oState.sY=this.nInfo.style.top;this.oState.sX=this.nInfo.style.left;this.fnSaveState()
},fnSaveState:function(){DesignCore.fnCreateCookie("SpryMediaUK_Design",DesignCore.toJsonString(this.oState))
},fnGetState:function(){try{var oObj=eval("("+DesignCore.fnReadCookie("SpryMediaUK_Design")+")");
return oObj}catch(err){return null}}};