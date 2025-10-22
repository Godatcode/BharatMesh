"use strict";
/**
 * BharatMesh Shared Types - Central Export
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageNames = void 0;
// Billing
__exportStar(require("./types/billing"), exports);
// Inventory
__exportStar(require("./types/inventory"), exports);
// Orders
__exportStar(require("./types/orders"), exports);
// Payments
__exportStar(require("./types/payments"), exports);
// Attendance
__exportStar(require("./types/attendance"), exports);
// User & Auth
__exportStar(require("./types/user"), exports);
// Sync & P2P
__exportStar(require("./types/sync"), exports);
// Business & Templates
__exportStar(require("./types/business"), exports);
exports.LanguageNames = {
    en: { native: 'English', english: 'English' },
    hi: { native: 'हिंदी', english: 'Hindi' },
    ta: { native: 'தமிழ்', english: 'Tamil' },
    te: { native: 'తెలుగు', english: 'Telugu' },
    bn: { native: 'বাংলা', english: 'Bengali' },
    mr: { native: 'मराठी', english: 'Marathi' },
    gu: { native: 'ગુજરાતી', english: 'Gujarati' },
    kn: { native: 'ಕನ್ನಡ', english: 'Kannada' },
    ml: { native: 'മലയാളം', english: 'Malayalam' }
};
//# sourceMappingURL=index.js.map