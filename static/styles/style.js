document.querySelector("bartab").addEventListener("click", function (){
	document.querySelector("groupbar").setAttribute("expanded", `${1-parseInt(document.querySelector("groupbar").getAttribute("expanded"))}`);
});