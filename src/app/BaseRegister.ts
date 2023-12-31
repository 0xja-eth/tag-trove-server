
export abstract class BaseRegister<
  TEnum extends number | string, D> {

  protected map = new Map<TEnum, D>();

  public add<T extends TEnum>(type: T, data: D) {
    this.map.set(type, data);
  }
  public get<T extends TEnum>(type?: T) {
    if (type == undefined) type = this.defaultType as T;
    let res = this.map.get(type);
    if (res == undefined) res = this.default;
    return res;
  }
  public keys() { return this.map.keys(); }
  public values() { return this.map.values(); }

  protected get default(): D { return null }
  protected get defaultType(): TEnum { return null }
}

export type Payload<T extends number | string,
  Payloads extends Record<string | number, any>> =
  {__payloads?: Payloads} & (T extends keyof Payloads ? Payloads[T] : null);

export type DataWithPayload<
  T extends number | string,
  Payloads extends Record<string | number, any>,
  Data = {}> = { type: T, payload?: Payload<T, Payloads> } & Data

export type ParamWithData<
  T extends number | string,
  Payloads extends Record<string | number, any>,
  Data = {}, Extra = {}> = Extra & {
  data: DataWithPayload<T, Payloads, Data>
}

export type PayloadFunc<
  T extends number | string,
  Payloads extends Record<string | number, any>,
  Data = {}, Extra = {}, R = any> =
  (params: ParamWithData<T, Payloads, Data, Extra>) => R

export abstract class PayloadFuncRegister<
  TEnum extends number | string,
  Payloads extends Record<string | number, any>,
  Data = {}, Extra = {}, R = any>
  extends BaseRegister<TEnum, PayloadFunc<TEnum, Payloads, Data, Extra, R>> {

  public add<T extends TEnum>(type: T, func: PayloadFunc<T, Payloads, Data, Extra, R>) {
    // @ts-ignore
    super.add(type, func);
  }
  // @ts-ignore
  public get<T extends TEnum>(type: T): PayloadFunc<T, Payloads, Data, Extra, R> {
    return super.get(type);
  }
  public do<T extends TEnum>(
    type: T, params: ParamWithData<T, Payloads, Data, Extra>) {
    const func = this.get(type);
    return this.wrapper(func, type)?.(params);
  }
  protected wrapper<T extends TEnum>(
    func: PayloadFunc<T, Payloads, Data, Extra, R>, type: T) {
    // params: ParamWithData<T, Payloads, Data, Extra>):
    // PayloadFunc<T, Payloads, Data, Extra, R>
    return func
  }
}

type DataParams<TEnum extends number | string> = {
  data: DataWithPayload<TEnum, Record<string | number, any>>
} & Record<string, any>;
type GetPayloads<TEnum extends number | string,
  P extends DataParams<TEnum>> = P["data"]["payload"]["__payloads"]
type GetData<TEnum extends number | string,
  P extends DataParams<TEnum>> = P["data"]
type GetExtra<TEnum extends number | string,
  P extends DataParams<TEnum>> = Omit<P, "data">

export abstract class DataPayloadFuncRegister<
  TEnum extends number | string,
  Params extends DataParams<TEnum>, R>
  extends PayloadFuncRegister<TEnum, GetPayloads<TEnum, Params>,
    GetData<TEnum, Params>, GetExtra<TEnum, Params>, R> {

}

