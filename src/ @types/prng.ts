import seedrandom from "seedrandom";

export default interface prng {
    (): number;
    double(): number;
    int32(): number;
    quick(): number;
    state(): seedrandom.State;
}