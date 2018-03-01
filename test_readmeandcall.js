//console.log('WTF!!!!')


class testClass{
    constructor()
    {
    }
    test()
    {
        console.log('It works!!!!')
    } 
}
module.exports = { testClass };
/*
var cat = {
    name: "Gus",
    color: "gray",
    age: 15,
  
    printInfo: function( dataParam ) {
       console.log("F - Name:", this.name, "Color:", this.color, "Age:", this.age, dataParam);
       nestedFunction = function() {
          console.log("N - Name:", this.name, "Color:", this.color, "Age:", this.age);
       }
       nestedFunction.call(this);
       nestedFunction.apply(this);
  
       var storeFunction = nestedFunction.bind(this);
    
       storeFunction();
    }
 }
 cat.printInfo('FRED');
*/