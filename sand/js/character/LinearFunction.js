class LinearFunction{
    //función de tipo f(x)=ax+b
    constructor(a, b){
        this.increment=a;
        this.base=b;
    }

    calculate(x){
        return (this.increment * x) + this.base;
    }

    derivate(){
        return this.increment;
    }
}
export default LinearFunction;