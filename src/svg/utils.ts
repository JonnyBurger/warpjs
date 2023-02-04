export function createElement(
  tag: string,
  attributes: Record<string, any> = {}
) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tag);

  for (let name of Object.keys(attributes)) {
    setProperty(element, name, attributes[name]);
  }

  return element;
}

export function getProperty(element: any, property: string) {
  if (element[property] instanceof SVGAnimatedLength) {
    return element[property].baseVal.value;
  }

  return element.getAttribute(property);
}

export function setProperty(element: any, property: string, value: any) {
  element.setAttribute(property, value);
}
