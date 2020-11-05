import Skill from "./Skill.js";

export default class Pasive extends Skill{
    constructor(params){
        super(params);
    }

    isAura(){
        return this.range.reach > 0;
    }
}