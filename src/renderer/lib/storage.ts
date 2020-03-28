export default class Storage {
  static set(key: string, value: any) {
    localStorage.setItem(`koala_diagram_${key}`, JSON.stringify(value));
  }

  static get(key: string): any | undefined {
    try {
      const value = localStorage.getItem(`koala_diagram_${key}`);
      return JSON.parse(value);
    } catch (err) {
      console.error('parse storage value error', err);
    }
  }
}
