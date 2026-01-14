// Comment that is displayed in the API documentation for the maquette module:
/**
 * Welcome to the API documentation of the **maquette** library.
 *
 * Maquette is a minimalistic virtual DOM library that provides a simple and efficient way to build
 * interactive web applications. To get started, use {@link createProjector} to create a projector
 * that manages the rendering lifecycle, and use the {@link h} function to create virtual DOM nodes.
 *
 * {@link https://maquettejs.org/ | ← Back to the maquette homepage}
 * @module
 */
export { createCache } from "./cache";
export { dom } from "./dom";
export { h } from "./h";
export * from "./interfaces";
export { createMapping } from "./mapping";
export { createProjector } from "./projector";
