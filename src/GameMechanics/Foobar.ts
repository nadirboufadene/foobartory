export interface FoobarElement {
  identifier: string;
}
export type Foo = FoobarElement;
export type Bar = FoobarElement;

export interface Foobar {
  foo: Foo;
  bar: Bar;
}
