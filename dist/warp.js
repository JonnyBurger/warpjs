"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Warp = void 0;
const normalize_1 = require("./svg/normalize");
const utils_1 = require("./svg/utils");
const parser_1 = __importDefault(require("./path/parser"));
const encoder_1 = __importDefault(require("./path/encoder"));
const interpolate_1 = require("./path/interpolate");
const transform_1 = __importDefault(require("./warp/transform"));
const interpolate_2 = __importDefault(require("./warp/interpolate"));
const extrapolate_1 = __importDefault(require("./warp/extrapolate"));
class Warp {
    constructor(element, curveType = "q") {
        this.element = element;
        (0, normalize_1.shapesToPaths)(element);
        (0, normalize_1.preparePaths)(element, curveType);
        const pathElements = Array.from(element.querySelectorAll("path"));
        this.paths = pathElements.map((pathElement) => {
            const pathString = (0, utils_1.getProperty)(pathElement, "d");
            const pathData = (0, parser_1.default)(pathString);
            return { pathElement, pathData };
        });
    }
    update() {
        for (let { pathElement, pathData } of this.paths) {
            const pathString = (0, encoder_1.default)(pathData);
            (0, utils_1.setProperty)(pathElement, "d", pathString);
        }
    }
    transform(transformers) {
        const actualTransformers = Array.isArray(transformers)
            ? transformers
            : [transformers];
        for (let path of this.paths) {
            path.pathData = (0, transform_1.default)(path.pathData, actualTransformers);
        }
        this.update();
    }
    interpolate(threshold) {
        let didWork = false;
        const deltaFunction = (points) => {
            const linearPoints = [
                points[0].slice(0, 2),
                points[points.length - 1].slice(0, 2),
            ];
            const delta = (0, interpolate_1.euclideanDistance)(linearPoints);
            didWork = didWork || delta > threshold;
            return delta;
        };
        for (let path of this.paths) {
            path.pathData = (0, interpolate_2.default)(path.pathData, threshold, deltaFunction);
        }
        return didWork;
    }
    extrapolate(threshold) {
        let didWork = false;
        const deltaFunction = (points) => {
            const linearPoints = [
                points[0].slice(0, 2),
                points[points.length - 1].slice(0, 2),
            ];
            const delta = (0, interpolate_1.euclideanDistance)(linearPoints);
            didWork = didWork || delta <= threshold;
            return delta;
        };
        for (let path of this.paths) {
            path.pathData = (0, extrapolate_1.default)(path.pathData, threshold, deltaFunction);
        }
        return didWork;
    }
    preInterpolate(transformer, threshold) {
        let didWork = false;
        const deltaFunction = (points) => {
            const linearPoints = [
                points[0].slice(0, 2),
                points[points.length - 1].slice(0, 2),
            ];
            const delta = (0, interpolate_1.euclideanDistance)(linearPoints);
            didWork = didWork || delta > threshold;
            return delta;
        };
        for (let path of this.paths) {
            const transformed = (0, transform_1.default)(path.pathData, [
                function (points) {
                    const newPoints = transformer(points.slice(0, 2));
                    newPoints.push(...points);
                    return newPoints;
                },
            ]);
            const interpolated = (0, interpolate_2.default)(transformed, threshold, deltaFunction);
            path.pathData = (0, transform_1.default)(interpolated, [
                (points) => points.slice(2),
            ]);
        }
        return didWork;
    }
    preExtrapolate(transformer, threshold) {
        let didWork = false;
        const deltaFunction = (points) => {
            const linearPoints = [
                points[0].slice(0, 2),
                points[points.length - 1].slice(0, 2),
            ];
            const delta = (0, interpolate_1.euclideanDistance)(linearPoints);
            didWork = didWork || delta <= threshold;
            return delta;
        };
        for (let path of this.paths) {
            const transformed = (0, transform_1.default)(path.pathData, [
                function (points) {
                    const newPoints = transformer(points.slice(0, 2));
                    newPoints.push(...points);
                    return newPoints;
                },
            ]);
            const extrapolated = (0, extrapolate_1.default)(transformed, threshold, deltaFunction);
            path.pathData = (0, transform_1.default)(extrapolated, [
                (points) => points.slice(2),
            ]);
        }
        return didWork;
    }
}
exports.Warp = Warp;
