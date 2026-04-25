export enum BotUserInfoGender {
  Unset = 0,
  Male = 1,
  Female = 2,
  Unknown = 255,
}

export enum BotUserInfoKey {
  Avatar = 101,
  Bio = 102,
  Remark = 103,
  Level = 105,
  BusinessList = 107,
  Nickname = 20002,
  Country = 20003,
  Gender = 20009,
  City = 20020,
  School = 20021,
  RegisterTime = 20026,
  Age = 20037,
  Qid = 27394,
}

export enum BotGroupMemberRole {
  Member = 0,
  Owner = 1,
  Admin = 2,
}

export enum RequestState {
  Default = 0,
  Pending = 1,
  Accepted = 2,
  Rejected = 3,
}
