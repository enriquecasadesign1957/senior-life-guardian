import { AsyncLocalStorage } from "node:async_hooks";
import { T as parseRedirect, K as mergeHeaders, o as isRedirect } from "../_libs/tanstack__router-core.mjs";
const manifest = {
  "00855e84a1941c0fbefa0c12aa60776792e2bcc046c2ea9242c2bc9934a75923": {
    functionName: "sendWellnessNotice_createServerFn_handler",
    importer: () => import("./wellness.functions-BXvn8iHP.mjs")
  },
  "032b3464796390af0ed85c62b85863d9e5257492e374885cb54ce2ca8b2870ad": {
    functionName: "lookupOneclickSignup_createServerFn_handler",
    importer: () => import("./oneclick.functions-BdcFjrey.mjs")
  },
  "06203203de242025ec96321aee7d989524a66c68ede46fb548991a6a44060649": {
    functionName: "inboxListMessages_createServerFn_handler",
    importer: () => import("./whatsapp-inbox.functions-CH-GaBZH.mjs")
  },
  "0c3e92bc1a70f27e802c02a8de9328f91018c358993d88a614988622d8329af2": {
    functionName: "verifyPinReset_createServerFn_handler",
    importer: () => import("./pin-reset.functions-CvGz9Zkg.mjs")
  },
  "0e9514cc9454dd757190c093d8b6402ba35afc0bb2b1a2408a032a8ef903c1c0": {
    functionName: "toggleGuardianActive_createServerFn_handler",
    importer: () => import("./guardians.functions-BMKtmt6A.mjs")
  },
  "0ec527a4b7421f30606b5033721bb9fa6a20b077e2afb20aa304720ec8a96406": {
    functionName: "requestPinReset_createServerFn_handler",
    importer: () => import("./pin-reset.functions-CvGz9Zkg.mjs")
  },
  "122b4d2c35d5f4c0bdf92dd76d25909e9b21b09afa20d1357066e2b624bd2dde": {
    functionName: "listGuardiansForFamily_createServerFn_handler",
    importer: () => import("./guardians.functions-BMKtmt6A.mjs")
  },
  "18121f8ba5e79db70a487455e310109dbdd4ffb9cb9ca514d4d5ebec438dd397": {
    functionName: "updateGuardianForFamily_createServerFn_handler",
    importer: () => import("./guardians.functions-BMKtmt6A.mjs")
  },
  "1b61e5c471372895d51371378250c3b8042b7aef7b4f5ca3433aaeac3267a6c2": {
    functionName: "authorizeOneclickRenewal_createServerFn_handler",
    importer: () => import("./oneclick.functions-BdcFjrey.mjs")
  },
  "1ea406a33b201149b7a61f13a2d5fcdf1ac6e42bcc5209a63310d0cf935b3b87": {
    functionName: "checkLastAlertAck_createServerFn_handler",
    importer: () => import("./family-portal.functions-DW88HX-c.mjs")
  },
  "2220038786157b3a399966ebefb2c64d16c76a2ce1601e8a35bd4573f9d67886": {
    functionName: "cancelSubscription_createServerFn_handler",
    importer: () => import("./webpay.functions-krUN_ceu.mjs")
  },
  "230816b26689b6ff9837dcee775dcf74513eae1a16e4623b821ff26fc4f356b7": {
    functionName: "sendEmergencyAlert_createServerFn_handler",
    importer: () => import("./emergency-alert.functions-Dq5unfCZ.mjs")
  },
  "2b17e3f7112775bcb1be66d8c42d9728d38ccd49587997b6e2707f7c5b39d59c": {
    functionName: "adminGrantFreeService_createServerFn_handler",
    importer: () => import("./admin-comp.functions-JAeuGHOH.mjs")
  },
  "303d4d806158d51b2bd7f29802806d4cc9b23a0448575e3a8cceaaadaf5faf45": {
    functionName: "resetTestData_createServerFn_handler",
    importer: () => import("./admin-reset.functions-hFN1_FBg.mjs")
  },
  "30aef816d2dd9d7269bc3ef865425125cabc7aadea0fa3df219b22cb1b8daae3": {
    functionName: "adminListDiscountCodes_createServerFn_handler",
    importer: () => import("./admin-discount.functions-CXwObYsM.mjs")
  },
  "30b4e1248a8269f53655ec205add83efa511f6c0264e59a0d741975db00cd817": {
    functionName: "confirmWebpayTransaction_createServerFn_handler",
    importer: () => import("./webpay.functions-krUN_ceu.mjs")
  },
  "3297861ceaad3995a5fa72b5ae7ebe8452c9e70a4a568f4dc02ddd1c91ea0a85": {
    functionName: "authorizeOneclickApprovedValidation_createServerFn_handler",
    importer: () => import("./oneclick.functions-BdcFjrey.mjs")
  },
  "3725fe32019aefc7583b0808c5418d39b799abd8e00f5589265e4634db8e3292": {
    functionName: "refundOneclickPayment_createServerFn_handler",
    importer: () => import("./oneclick.functions-BdcFjrey.mjs")
  },
  "37f1021d63dc8699956e8d92b927546dcb286d1d65a9561708627ee284f1862d": {
    functionName: "adminUpdateDiscountCode_createServerFn_handler",
    importer: () => import("./admin-discount.functions-CXwObYsM.mjs")
  },
  "3967a73ccc758db45cb7c6478ab42df1a6208f305774be3cd611e4ae07cd1235": {
    functionName: "listGuardians_createServerFn_handler",
    importer: () => import("./guardians.functions-BMKtmt6A.mjs")
  },
  "3ad3ba7beacd948e4ae5ca2fcc6ab5862cd8dd3aff94a4120f39f878d0bde814": {
    functionName: "validateDiscountCode_createServerFn_handler",
    importer: () => import("./discount.functions-CYAdTcvX.mjs")
  },
  "3be681a33b33cb86fba3d4e0ac3bca20ea26b242f01edd24a4e704ecb61697cf": {
    functionName: "listFamily_createServerFn_handler",
    importer: () => import("./family.functions-BBCvNvBk.mjs")
  },
  "3d83c7437c1ae898c4413cae576a77123c8756291e4eb33d1700f77b23f26cb5": {
    functionName: "mockApproveWebpay_createServerFn_handler",
    importer: () => import("./webpay.functions-krUN_ceu.mjs")
  },
  "4302044dc15b603feee5ce7c90c04e40e5ae43fe1b93e0ca2151577daa83fea5": {
    functionName: "toggleGuardianActiveForFamily_createServerFn_handler",
    importer: () => import("./guardians.functions-BMKtmt6A.mjs")
  },
  "440e55caad90d86eb07882d142a02908fd50cdbd1b2394477f9f74ff47879d96": {
    functionName: "setUserPin_createServerFn_handler",
    importer: () => import("./family.functions-BBCvNvBk.mjs")
  },
  "4663d5420c2be39bc36cdeaf601b48729132d7e22f6ffcf0ea499e960cedb532": {
    functionName: "updateFamily_createServerFn_handler",
    importer: () => import("./family.functions-BBCvNvBk.mjs")
  },
  "46a4a9651c3151df248984eb322707475d13cc0b0ba258591c6afc0b50104a5e": {
    functionName: "activateWhatsAppFromApp_createServerFn_handler",
    importer: () => import("./whatsapp-activation.functions-86dZQBe5.mjs")
  },
  "49263aa3ee9117f2df910b74868e6dffc188033bbea71c85d356956dc46dec62": {
    functionName: "createPurchaseSignup_createServerFn_handler",
    importer: () => import("./purchase-signup.functions-Gs38c5zy.mjs")
  },
  "509a9a2e3522816d5339866552bd5894e7842dc8fa764af28499cebb6a6cd464": {
    functionName: "resendFamilyInvite_createServerFn_handler",
    importer: () => import("./family.functions-BBCvNvBk.mjs")
  },
  "55dff177ecc3a93ada34854da91b29cf509b7d27253e06022d2ab03f34020a87": {
    functionName: "adminRevokeFreeService_createServerFn_handler",
    importer: () => import("./admin-comp.functions-JAeuGHOH.mjs")
  },
  "59cf47dfae0d7055f2567c51206e3f0457c054d7b0dee31000b52891a5c191bc": {
    functionName: "requestFamilyCode_createServerFn_handler",
    importer: () => import("./family-portal.functions-DW88HX-c.mjs")
  },
  "5e97b23f151022839e4e83bc879306130cac9f23fcccc372554b60cecb070318": {
    functionName: "inboxListThreads_createServerFn_handler",
    importer: () => import("./whatsapp-inbox.functions-CH-GaBZH.mjs")
  },
  "669236d887219b5cba67ca1a69b26075024f75fb112aad36be6ad52c85fac831": {
    functionName: "statusOneclickPayment_createServerFn_handler",
    importer: () => import("./oneclick.functions-BdcFjrey.mjs")
  },
  "6e7575f9709049c47e6d5a4a99a6fe6ef605a1ee7bcb1a6f550d344174bff5a2": {
    functionName: "inboxSendReply_createServerFn_handler",
    importer: () => import("./whatsapp-inbox.functions-CH-GaBZH.mjs")
  },
  "7250cf59222a6629bf78e657b04ea63cac9dfee7008edb64ac71b073cb8057f5": {
    functionName: "getInstallProgress_createServerFn_handler",
    importer: () => import("./install-step.functions-B_fLgQwT.mjs")
  },
  "746d37c9d4e786a9e375410df0f2051ad7b4dff5079870f21a5d73c9b4833ce6": {
    functionName: "completeCheckoutProfile_createServerFn_handler",
    importer: () => import("./complete-checkout-profile.functions-EC6Co1XS.mjs")
  },
  "873b2cf0b78578ee868a90139361de98063bee5b8b3bbc84ca30c237a409df8c": {
    functionName: "reportAppOpened_createServerFn_handler",
    importer: () => import("./install-step.functions-B_fLgQwT.mjs")
  },
  "8e226ea55e96811ba5254acae56d8c9f16fd4522a02c63de440fa788d9d8d003": {
    functionName: "getFamilyDashboard_createServerFn_handler",
    importer: () => import("./family-portal.functions-DW88HX-c.mjs")
  },
  "8ec988b1ec129494f6915b9e1d8d18f708b1bdc143c63ec18b9228ab06d63219": {
    functionName: "getAppConfiguration_createServerFn_handler",
    importer: () => import("./family.functions-BBCvNvBk.mjs")
  },
  "9c56cc837291f0bd3826bbc81bf0b24e052e9c52e00564856ca0d8264773c450": {
    functionName: "deleteGuardianForFamily_createServerFn_handler",
    importer: () => import("./guardians.functions-BMKtmt6A.mjs")
  },
  "9f0bc305f67a379686dfa7394fe92636a04e95954ddc34794fd5412a093ee47a": {
    functionName: "initOneclickCheckout_createServerFn_handler",
    importer: () => import("./oneclick.functions-BdcFjrey.mjs")
  },
  "b3bd8a8169294987fd3f3dd9e5528b7d6d11ebfdeba8937c444f9613d6a27cf5": {
    functionName: "activateSubscription_createServerFn_handler",
    importer: () => import("./webpay.functions-krUN_ceu.mjs")
  },
  "be96532580220357b9a595387044d6d5b95b8dd7dca128dfcfa860c8eec42774": {
    functionName: "updateGuardian_createServerFn_handler",
    importer: () => import("./guardians.functions-BMKtmt6A.mjs")
  },
  "c277e653cfcaf353f1063a817054e616931d8c904f941242901bd7ee3d59c27f": {
    functionName: "addGuardianForFamily_createServerFn_handler",
    importer: () => import("./guardians.functions-BMKtmt6A.mjs")
  },
  "c7d01bf199875a53070189b5b003f24d77b88e339e7eb0af33ca1f493354124f": {
    functionName: "resetMyAccountData_createServerFn_handler",
    importer: () => import("./admin-reset.functions-hFN1_FBg.mjs")
  },
  "cb8c52d05c781d97ae10026983549f22966b649b134312ffc0f8e656f7866a18": {
    functionName: "reportFallSensorPrompted_createServerFn_handler",
    importer: () => import("./install-step.functions-B_fLgQwT.mjs")
  },
  "cda831f9caa83cf01f60daed672052117b1e372271f35770066f0698512821c0": {
    functionName: "addGuardian_createServerFn_handler",
    importer: () => import("./guardians.functions-BMKtmt6A.mjs")
  },
  "dc9bc96118e6fcab2406d51b9a7ebac3fe76136a601b5df973e2acd759e8bdb3": {
    functionName: "upsertHeartbeat_createServerFn_handler",
    importer: () => import("./heartbeat.functions-CPUqBiVb.mjs")
  },
  "dc9d21f4a02b80175ca7fc43528d010ae7703c94db95e67de97ae4140897b72a": {
    functionName: "verifyPin_createServerFn_handler",
    importer: () => import("./family.functions-BBCvNvBk.mjs")
  },
  "dd46ac90a05be68c498e3572c702ea9c0bd77cc517a307b88b22786e8f5b4891": {
    functionName: "initWebpayTransaction_createServerFn_handler",
    importer: () => import("./webpay.functions-krUN_ceu.mjs")
  },
  "deecda74f761541032cc7e293870367b07f97fbfe4a2e51c2765350c8af2b5ce": {
    functionName: "verifyFamilyCode_createServerFn_handler",
    importer: () => import("./family-portal.functions-DW88HX-c.mjs")
  },
  "e0e302b84550931ff22a29cf053486bd1e43f94e1dce4281a6e7f9aa0a849097": {
    functionName: "authorizeOneclickTenMillionRejectValidation_createServerFn_handler",
    importer: () => import("./oneclick.functions-BdcFjrey.mjs")
  },
  "e13cfa5b8a1823d3e3716ef861d913c0c2859713724944d73df9cc5f9ba0d80b": {
    functionName: "getOneclickValidationInfo_createServerFn_handler",
    importer: () => import("./oneclick.functions-BdcFjrey.mjs")
  },
  "e37c3104c6c2c3d44962c62afa5fa685f16eae22ee3cbde32bf4ba9c2cfe106c": {
    functionName: "removeOneclickInscription_createServerFn_handler",
    importer: () => import("./oneclick.functions-BdcFjrey.mjs")
  },
  "e6d341a323421c0d809d9a880176cc6843cb27f7387fd1d4ac3d9e4ddccdd78a": {
    functionName: "deleteGuardian_createServerFn_handler",
    importer: () => import("./guardians.functions-BMKtmt6A.mjs")
  },
  "ea9e4068ab84a430a3cca3fc91b7eb8019aee8b419ca7a5a85c557a842cf8692": {
    functionName: "ackAlertByToken_createServerFn_handler",
    importer: () => import("./family-portal.functions-DW88HX-c.mjs")
  },
  "f109b7c4d6759a9f0d49b4960c44e13366c4a1d1f01894b7143eeb71bf54f0b6": {
    functionName: "reportSosPrimed_createServerFn_handler",
    importer: () => import("./install-step.functions-B_fLgQwT.mjs")
  },
  "f27efb3e2b865251959452215d37d8d60ef542512841abc03138a96ddd48e6d5": {
    functionName: "adminLookupAccount_createServerFn_handler",
    importer: () => import("./admin-comp.functions-JAeuGHOH.mjs")
  },
  "f3f1ef40414c3f47bc1651ef20f516ac2e248174c7b3eb95ad4cb3babab6e182": {
    functionName: "addFamily_createServerFn_handler",
    importer: () => import("./family.functions-BBCvNvBk.mjs")
  },
  "f4d059838c989cd4572bfdf2329a53b5e410421910102400a47e62ae60dcb21d": {
    functionName: "finishOneclickCheckout_createServerFn_handler",
    importer: () => import("./oneclick.functions-BdcFjrey.mjs")
  },
  "f57474d5164d60b5538080a511af550c350019658c9e3c891c9fc11b8eefb25d": {
    functionName: "deleteFamily_createServerFn_handler",
    importer: () => import("./family.functions-BBCvNvBk.mjs")
  },
  "fb1afaddadfef2cade4defacd62c0f3ecb8f4933ef8396f125de993f4e5766ba": {
    functionName: "cancelEmergencyAlert_createServerFn_handler",
    importer: () => import("./emergency-alert.functions-Dq5unfCZ.mjs")
  },
  "fef21ae8725155f7665a0a68200b91ed27ec5ce45745f274849624a3f90e49d3": {
    functionName: "adminCreateDiscountCode_createServerFn_handler",
    importer: () => import("./admin-discount.functions-CXwObYsM.mjs")
  }
};
async function getServerFnById(id, access) {
  const serverFnInfo = manifest[id];
  if (!serverFnInfo) {
    throw new Error("Server function info not found for " + id);
  }
  const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
  if (!fnModule) {
    throw new Error("Server function module not resolved for " + id);
  }
  const action = fnModule[serverFnInfo.functionName];
  if (!action) {
    throw new Error("Server function module export not resolved for serverFn ID: " + id);
  }
  return action;
}
var TSS_FORMDATA_CONTEXT = "__TSS_CONTEXT";
var TSS_SERVER_FUNCTION = /* @__PURE__ */ Symbol.for("TSS_SERVER_FUNCTION");
var TSS_SERVER_FUNCTION_FACTORY = /* @__PURE__ */ Symbol.for("TSS_SERVER_FUNCTION_FACTORY");
var X_TSS_SERIALIZED = "x-tss-serialized";
var X_TSS_RAW_RESPONSE = "x-tss-raw";
var TSS_CONTENT_TYPE_FRAMED = "application/x-tss-framed";
var FrameType = {
  /** Seroval JSON chunk (NDJSON line) */
  JSON: 0,
  /** Raw stream data chunk */
  CHUNK: 1,
  /** Raw stream end (EOF) */
  END: 2,
  /** Raw stream error */
  ERROR: 3
};
var FRAME_HEADER_SIZE = 9;
var TSS_CONTENT_TYPE_FRAMED_VERSIONED = `${TSS_CONTENT_TYPE_FRAMED}; v=1`;
function isSafeKey(key) {
  return key !== "__proto__" && key !== "constructor" && key !== "prototype";
}
function safeObjectMerge(target, source) {
  const result = /* @__PURE__ */ Object.create(null);
  if (target) {
    for (const key of Object.keys(target)) if (isSafeKey(key)) result[key] = target[key];
  }
  if (source && typeof source === "object") {
    for (const key of Object.keys(source)) if (isSafeKey(key)) result[key] = source[key];
  }
  return result;
}
function createNullProtoObject(source) {
  if (!source) return /* @__PURE__ */ Object.create(null);
  const obj = /* @__PURE__ */ Object.create(null);
  for (const key of Object.keys(source)) if (isSafeKey(key)) obj[key] = source[key];
  return obj;
}
var GLOBAL_STORAGE_KEY = /* @__PURE__ */ Symbol.for("tanstack-start:start-storage-context");
var globalObj = globalThis;
if (!globalObj[GLOBAL_STORAGE_KEY]) globalObj[GLOBAL_STORAGE_KEY] = new AsyncLocalStorage();
var startStorage = globalObj[GLOBAL_STORAGE_KEY];
async function runWithStartContext(context, fn) {
  return startStorage.run(context, fn);
}
function getStartContext(opts) {
  const context = startStorage.getStore();
  if (!context && opts?.throwIfNotFound !== false) throw new Error(`No Start context found in AsyncLocalStorage. Make sure you are using the function within the server runtime.`);
  return context;
}
var getStartOptions = () => getStartContext().startOptions;
var getStartContextServerOnly = getStartContext;
var createServerFn = (options, __opts) => {
  const resolvedOptions = __opts || options || {};
  if (typeof resolvedOptions.method === "undefined") resolvedOptions.method = "GET";
  const res = {
    options: resolvedOptions,
    middleware: (middleware) => {
      const newMiddleware = [...resolvedOptions.middleware || []];
      middleware.map((m) => {
        if (TSS_SERVER_FUNCTION_FACTORY in m) {
          if (m.options.middleware) newMiddleware.push(...m.options.middleware);
        } else newMiddleware.push(m);
      });
      const res2 = createServerFn(void 0, {
        ...resolvedOptions,
        middleware: newMiddleware
      });
      res2[TSS_SERVER_FUNCTION_FACTORY] = true;
      return res2;
    },
    inputValidator: (inputValidator) => {
      return createServerFn(void 0, {
        ...resolvedOptions,
        inputValidator
      });
    },
    handler: (...args) => {
      const [extractedFn, serverFn] = args;
      const newOptions = {
        ...resolvedOptions,
        extractedFn,
        serverFn
      };
      const resolvedMiddleware = [...newOptions.middleware || [], serverFnBaseToMiddleware(newOptions)];
      extractedFn.method = resolvedOptions.method;
      return Object.assign(async (opts) => {
        const result = await executeMiddleware(resolvedMiddleware, "client", {
          ...extractedFn,
          ...newOptions,
          data: opts?.data,
          headers: opts?.headers,
          signal: opts?.signal,
          fetch: opts?.fetch,
          context: createNullProtoObject()
        });
        const redirect = parseRedirect(result.error);
        if (redirect) throw redirect;
        if (result.error) throw result.error;
        return result.result;
      }, {
        ...extractedFn,
        method: resolvedOptions.method,
        __executeServer: async (opts) => {
          const startContext = getStartContextServerOnly();
          const serverContextAfterGlobalMiddlewares = startContext.contextAfterGlobalMiddlewares;
          return await executeMiddleware(resolvedMiddleware, "server", {
            ...extractedFn,
            ...opts,
            serverFnMeta: extractedFn.serverFnMeta,
            context: safeObjectMerge(opts.context, serverContextAfterGlobalMiddlewares),
            request: startContext.request
          }).then((d) => ({
            result: d.result,
            error: d.error,
            context: d.sendContext
          }));
        }
      });
    }
  };
  const fun = (options2) => {
    return createServerFn(void 0, {
      ...resolvedOptions,
      ...options2
    });
  };
  return Object.assign(fun, res);
};
async function executeMiddleware(middlewares, env, opts) {
  let flattenedMiddlewares = flattenMiddlewares([...getStartOptions()?.functionMiddleware || [], ...middlewares]);
  if (env === "server") {
    const startContext = getStartContextServerOnly({ throwIfNotFound: false });
    if (startContext?.executedRequestMiddlewares) flattenedMiddlewares = flattenedMiddlewares.filter((m) => !startContext.executedRequestMiddlewares.has(m));
  }
  const callNextMiddleware = async (ctx) => {
    const nextMiddleware = flattenedMiddlewares.shift();
    if (!nextMiddleware) return ctx;
    try {
      if ("inputValidator" in nextMiddleware.options && nextMiddleware.options.inputValidator && env === "server") ctx.data = await execValidator(nextMiddleware.options.inputValidator, ctx.data);
      let middlewareFn = void 0;
      if (env === "client") {
        if ("client" in nextMiddleware.options) middlewareFn = nextMiddleware.options.client;
      } else if ("server" in nextMiddleware.options) middlewareFn = nextMiddleware.options.server;
      if (middlewareFn) {
        const userNext = async (userCtx = {}) => {
          const result2 = await callNextMiddleware({
            ...ctx,
            ...userCtx,
            context: safeObjectMerge(ctx.context, userCtx.context),
            sendContext: safeObjectMerge(ctx.sendContext, userCtx.sendContext),
            headers: mergeHeaders(ctx.headers, userCtx.headers),
            _callSiteFetch: ctx._callSiteFetch,
            fetch: ctx._callSiteFetch ?? userCtx.fetch ?? ctx.fetch,
            result: userCtx.result !== void 0 ? userCtx.result : userCtx instanceof Response ? userCtx : ctx.result,
            error: userCtx.error ?? ctx.error
          });
          if (result2.error) throw result2.error;
          return result2;
        };
        const result = await middlewareFn({
          ...ctx,
          next: userNext
        });
        if (isRedirect(result)) return {
          ...ctx,
          error: result
        };
        if (result instanceof Response) return {
          ...ctx,
          result
        };
        if (!result) throw new Error("User middleware returned undefined. You must call next() or return a result in your middlewares.");
        return result;
      }
      return callNextMiddleware(ctx);
    } catch (error) {
      return {
        ...ctx,
        error
      };
    }
  };
  return callNextMiddleware({
    ...opts,
    headers: opts.headers || {},
    sendContext: opts.sendContext || {},
    context: opts.context || createNullProtoObject(),
    _callSiteFetch: opts.fetch
  });
}
function flattenMiddlewares(middlewares, maxDepth = 100) {
  const seen = /* @__PURE__ */ new Set();
  const flattened = [];
  const recurse = (middleware, depth) => {
    if (depth > maxDepth) throw new Error(`Middleware nesting depth exceeded maximum of ${maxDepth}. Check for circular references.`);
    middleware.forEach((m) => {
      if (m.options.middleware) recurse(m.options.middleware, depth + 1);
      if (!seen.has(m)) {
        seen.add(m);
        flattened.push(m);
      }
    });
  };
  recurse(middlewares, 0);
  return flattened;
}
async function execValidator(validator, input) {
  if (validator == null) return {};
  if ("~standard" in validator) {
    const result = await validator["~standard"].validate(input);
    if (result.issues) throw new Error(JSON.stringify(result.issues, void 0, 2));
    return result.value;
  }
  if ("parse" in validator) return validator.parse(input);
  if (typeof validator === "function") return validator(input);
  throw new Error("Invalid validator type!");
}
function serverFnBaseToMiddleware(options) {
  return {
    "~types": void 0,
    options: {
      inputValidator: options.inputValidator,
      client: async ({ next, sendContext, fetch, ...ctx }) => {
        const payload = {
          ...ctx,
          context: sendContext,
          fetch
        };
        return next(await options.extractedFn?.(payload));
      },
      server: async ({ next, ...ctx }) => {
        const result = await options.serverFn?.(ctx);
        return next({
          ...ctx,
          result
        });
      }
    }
  };
}
export {
  FrameType as F,
  TSS_CONTENT_TYPE_FRAMED_VERSIONED as T,
  X_TSS_SERIALIZED as X,
  getServerFnById as a,
  TSS_FORMDATA_CONTEXT as b,
  createNullProtoObject as c,
  X_TSS_RAW_RESPONSE as d,
  getStartOptions as e,
  flattenMiddlewares as f,
  getStartContext as g,
  FRAME_HEADER_SIZE as h,
  TSS_SERVER_FUNCTION as i,
  createServerFn as j,
  runWithStartContext as r,
  safeObjectMerge as s
};
