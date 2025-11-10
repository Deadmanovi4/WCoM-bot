"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_handler_1 = require("../database/database-handler");
const shops_database_1 = require("../database/shops/shops-database");
(0, database_handler_1.save)(shops_database_1.shopsDatabase);