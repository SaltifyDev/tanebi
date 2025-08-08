export enum WireType {
    Varint = 0,
    Fixed64 = 1,
    LengthDelimited = 2,
    Fixed32 = 5,

    // deprecated
    StartGroup = 3,
    
    // deprecated
    EndGroup = 4,
}