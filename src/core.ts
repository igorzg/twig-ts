/**
 * Create unique id
 *
 * @returns {string}
 */
export function uuid() {
	let d = new Date().getTime();
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		let r = (d + Math.random() * 16) % 16 | 0;
		d = Math.floor(d / 16);
		return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
	});
}

/**
 * Async function
 * @param genFunc Generator
 * @returns {Function}
 */
export function async(genFunc):Promise<any> {
	let generator = genFunc();

	try {
		return _handleAsync(generator.next());
	} catch (e) {
		return Promise.reject(e);
	}
	/**
	 * Handler async
	 * @param item
	 * @returns {any}
	 * @private
	 */
	function _handleAsync(item) {
		if (item.done) {
			return Promise.resolve(item.value);
		}
		return Promise
			.resolve(item.value)
			.then(
				val => _handleAsync(generator.next(val)),
				e => _handleAsync(generator.throw(e))
			);
	}

}
/**
 * @since 0.0.1
 * @author Igor Ivanovic
 * @function isBoolean
 *
 * @description
 * Check if value is boolean
 */
export function isBoolean(value) {
	return typeof value === 'boolean';
}
/**
 * @since 0.0.1
 * @author Igor Ivanovic
 * @function isUndefined
 *
 * @description
 * Check if value is un-defined
 */
export function isUndefined(value) {
	return typeof value === 'undefined';
}
/**
 * @since 0.0.1
 * @author Igor Ivanovic
 * @function isString
 *
 * @description
 * Check if value is string
 */
export function isString(value) {
	return typeof value === 'string';
}
/**
 * @since 0.0.1
 * @author Igor Ivanovic
 * @function isNumber
 *
 * @description
 * Check if value is isNumber
 */
export function isNumber(value) {
	return typeof value === 'number' && !isNaN(value);
}
/**
 * Internal is number
 * @param value
 * @returns {boolean}
 * @private
 */
function _isNumber(value) {
	return typeof value === 'number';
}
/**
 * @since 0.0.1
 * @author Igor Ivanovic
 * @function isArray
 *
 * @description
 * Check if value is array
 */
export function isArray(value) {
	return Array.isArray(value);
}
/**
 * @since 0.0.1
 * @author Igor Ivanovic
 * @function isNull
 *
 * @description
 * Check if value is funciton
 */
export function isNull(value) {
	return value === null;
}
/**
 * @since 0.0.1
 * @author Igor Ivanovic
 * @function isFunction
 *
 * @description
 * Check if value is funciton
 */
export function isFunction(value) {
	return typeof value === 'function';
}
/**
 * @since 0.0.1
 * @author Igor Ivanovic
 * @function isArray
 *
 * @description
 * Check if value is array
 */
export function isDate(value) {
	return Object.prototype.toString.call(value) === '[object Date]';
}
/**
 * @since 0.0.1
 * @author Igor Ivanovic
 * @function isRegExp
 *
 * @description
 * Check if object is an regular expression
 */
export function isRegExp(value) {
	return Object.prototype.toString.call(value) === '[object RegExp]';
}
/**
 * @since 0.0.1
 * @author Igor Ivanovic
 * @function isObject
 *
 * @description
 * Check if value is object
 */
export function isObject(value) {
	return !isNull(value) && typeof value === 'object';
}

/**
 * @since 0.0.1
 * @author Igor Ivanovic
 * @function isInitialized
 *
 * @description
 * Check if value is object
 */
export function isInitialized(value) {
	return !isNull(value) && !isUndefined(value);
}
/**
 * @since 0.0.1
 * @author Igor Ivanovic
 * @function isEqual
 *
 * @description
 * Check if two objects are equal
 */
export function isEqual(a, b) {
	if (isString(a)) {
		return a === b;
	} else if (_isNumber(a)) {
		if (isNaN(a) || isNaN(b)) {
			return isNaN(a) === isNaN(b);
		}
		return a === b;
	} else if (isBoolean(a)) {
		return a === b;
	} else if (isDate(a)) {
		return a.getTime() === b.getTime();
	} else if (isRegExp(a)) {
		return a.source === b.source;
	} else if (isArray(a) && isArray(b)) {

		// check references first
		if (a === b) {
			return true;
		} else if (a.constructor.name !== b.constructor.name) {
			return false;
		}

		try {
			if (a.length !== b.length) {
				return false;
			}
			return a.every((item, index) => isEqual(item, b[index]));
		} catch (e) {
			throw e;
		}
	} else if (isObject(a) && isObject(b)) {
		let equal = [];
		// check references first

		if (a === b) {
			return true;
		} else if (a.constructor.name !== b.constructor.name) {
			return false;
		}

		try {
			if (Object.keys(a).length === Object.keys(b).length) {
				Object.keys(a).forEach(key => equal.push(isEqual(a[key], b[key])));
			}
		} catch (e) {
			throw e;
		}

		if (equal.length === 0) {
			return false;
		}
		return equal.every((item) => item === true);
		/// compare undefined and nulls
	} else if (a === b) {
		return true;
	}

	return false;
}