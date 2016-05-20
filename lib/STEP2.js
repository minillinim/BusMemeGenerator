
int sum = 0;
for (var i = 2; i < process.argv.length;i++){
	sum = sum + +process.argv[i];	
}
console.log(sum);