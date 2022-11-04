/**
 * 邮箱
 */
export const emailReg = /^[\w.-]+@(\w+\.)+\w+$/;
/**
 * 邮编
 */
export const zipcodeReg = /^\d{6}$/;
/**
 * 手机号
 */
export const mobileReg = /^1\d{10}$/;
/**
 * 身份证
 */
export const idCardReg = /^[1-9]\d{5}[1-9]\d{3}(0[1-9]|1[012])([012]\d|3[01])\d{3}[\dXx]$/;

/**
 * 整数，支持正负号
 */
export const intReg = /^[+-]?\d+$/;
/**
 * 整数，必须带符号
 */
export const intSignReg = /^[+-]\d+$/;
/**
 * 正整数，不带符号
 */
export const intNoSignReg = /^\d+$/;

/**
 * 浮点数，支持正负号
 */
export const floatReg = /^[+-]?\d+\.\d+$/;
/**
 * 浮点数，必须带符号
 */
export const floatSignReg = /^[+-]\d+\.\d+$/;
/**
 * 正浮点数，不带符号
 */
export const floatNoSignReg = /^\d+\.\d+$/;

/**
 * 数字，不限定整数或者浮点数，支持正负号
 */
export const numberReg = /^[+-]?\d+(\.\d+)?$/;
/**
 * 数字，不限定整数或者浮点数，必须带符号
 */
export const numberSignReg = /^[+-]\d+(\.\d+)?$/;
/**
 * 正数，不限定整数或者浮点数，不带符号
 */
export const numberNoSignReg = /^\d+(\.\d+)?$/;
