Vue.filter('ToShortDate', function(value) {
	var r = /\d{1,4}-\d{1,2}-\d{1,2}/;
	var v = r.exec(value);
	if(v && v != '1900-01-01') return v.toString();
	else return '';
});