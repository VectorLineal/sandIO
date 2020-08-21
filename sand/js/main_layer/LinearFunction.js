export default class LinearFunction{
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

    toString(){
        var answer = "";

        if(this.increment == 0 && this.base == 0){
            return "0";
        }

        if(this.increment != 0){
            if(this.increment == -1){
                answer += "-x";
            } else if(this.increment == 1){
                answer += "x";
            }else{
                answer += this.increment + "x";
            }
        }

        if(this.base != 0){
            if(this.base < 0){
                answer += this.base;
            } else if(this.base > 0){
                answer += "+" + this.base;
            }
        }
        return answer;
    }
}