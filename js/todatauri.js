/* https://fransdejonge.com/2014/02/data-uri-bookmarklet/ */
/* Frans de Jonge <fransdejonge@gmail.com> */
var xhr = new XMLHttpRequest(),
	  reader = new FileReader();
xhr.open('GET', location.href, true);
xhr.responseType = 'blob';
xhr.addEventListener('load', function () {
	  if (xhr.status === 200) {
		    reader.addEventListener('load', function (e) {
			      location.href = e.target.result;
		    });
		    var responseWithMimeType = new Blob(new Array(xhr.response), {
			      'type': xhr.getResponseHeader('Content-Type')
		    });
		    reader.readAsDataURL(responseWithMimeType);
	  }
});
xhr.send();
