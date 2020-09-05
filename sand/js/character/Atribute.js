import LinearFunction from "../main_layer/LinearFunction.js";

class Atribute{
    constructor(params){
        this.name = params.name
        if(params.increment != null & params.base != null){
            this.change = new LinearFunction(params.increment, params.base);
        }else if(params.inline != null){
            this.change = params.inline;
        }else{
            console.log("didn't add a valid function, using f(x) = 0");
            this.change = new LinearFunction(0, 0);
        }
        
        this.current = this.change.calculate(0);
    }

    update(x){
        this.current = this.change.calculate(x);
    }

    //todos los atributos mejoran 3 stats del personaje
    getStat1(){
        switch(this.name){
            case "stregth":
                //fortaleza
                return 0.3 * this.current;
            case "resistance":
                //salud
                return 20 * this.current;
            case "agility":
                //velocidad
                return 0.02 * this.current;
            case "perception":
                //critico
                return 0.15 * this.current;
            case "intelligence":
                //mana
                return 12 * this.current;
            case "determination":
                //voluntad
                return 0.6 * this.current;
        }
    }

    getStat2(){
        switch(this.name){
            case "stregth":
                //daño
                return 2 * this.current;
            case "resistance":
                //regen_salud
                return 0.2 * this.current;
            case "agility":
                //velocidad_ataque
                return 2 * this.current;
            case "perception":
                //precision
                return 0.4 * this.current;
            case "intelligence":
                //regen_mana
                return 0.1 * this.current;
            case "determination":
                //armadura_magica
                return 0.6 * this.current;
        }
    }

    getStat3(){
        switch(this.name){
            case "stregth":
                //armadura
                return 0.6 * this.current;
            case "resistance":
                //fortaleza
                return 0.3 * this.current;
            case "agility":
                //evasion
                return 0.3 * this.current;
            case "perception":
                //evasion
                return 0.3 * this.current;
            case "intelligence":
                //poder_hechizo
                return 0.2 * this.current;
            case "determination":
                //concentracion
                return 0.6 * this.current;
        }
    }
}

export default Atribute;