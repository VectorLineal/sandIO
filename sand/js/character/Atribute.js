const LinearFunction = require("./utilities/LinearFunction");

class Atribute{
    constructor(name, base, increment){
        this.name = name
        this.change = LinearFunction(increment, base);
        this.current = this.change.calculate(0);
    }

    update(x){
        this.current = this.change.calculate(x);
    }

    //todos los atributos mejoran 3 stats del personaje
    getStats(){
        switch(this.name){
            case "stregth":
                //fortaleza, daño, armadura
                return [0.3 * this.current, 4 * this.current, 0.6 * this.current];
            case "resistance":
                //salud, regen_salud, fortaleza
                return [40 * this.current, 0.4 * this.current, 0.3 * this.current];
            case "agility":
                //velocidad, velocidad_ataque, evasion
                return [this.current, 8 * this.current, 0.3 * this.current];
            case "perception":
                //critico, precision, evasion
                return [0.3 * this.current, 0.4 * this.current, 0.3 * this.current];
            case "intelligence":
                //mana, regen_mana, poder_hechizo
                return [24 * this.current, 0.2 * this.current, 0.2 * this.current];
            case "determination":
                //voluntad, armadura_magica, concentracion
                return [0.6 * this.current, 0.6 * this.current, 0.6 * this.current];
        }
    }
}