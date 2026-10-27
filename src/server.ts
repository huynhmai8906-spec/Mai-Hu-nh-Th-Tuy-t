import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);

      // GoCare Connected APIs server proxy
      if (url.pathname.startsWith("/api/gocare/")) {
        const {
          getConnectedApiRegistry,
          hl7LiveApi,
          resortV2Api,
          clevelandClinicApi,
          dispatchApi,
          GOCARE_KEYS,
        } = await import("./lib/gocare-apis");

        if (url.pathname === "/api/gocare/status") {
          return Response.json({
            success: true,
            apis: getConnectedApiRegistry(),
            keysLinked: {
              hl7: GOCARE_KEYS.HL7.slice(0, 12) + "...",
              resort: GOCARE_KEYS.RESORT.slice(0, 12) + "...",
              cleveland: GOCARE_KEYS.CLEVELAND.slice(0, 12) + "...",
              dispatch: GOCARE_KEYS.DISPATCH.slice(0, 12) + "...",
            },
          });
        }

        if (url.pathname === "/api/gocare/hl7/telemetry") {
          const telemetry = await hl7LiveApi.getLiveTelemetry();
          return Response.json({ success: true, data: telemetry });
        }

        if (url.pathname === "/api/gocare/hl7/export") {
          const bundle = await hl7LiveApi.exportFHIRBundle();
          return Response.json(bundle, {
            headers: {
              "Content-Type": "application/fhir+json; charset=utf-8",
              "Content-Disposition": 'attachment; filename="gocare-ehr-fhir.json"',
            },
          });
        }

        if (url.pathname === "/api/gocare/resort/suites") {
          const suites = await resortV2Api.getSuites();
          return Response.json({ success: true, data: suites });
        }

        if (url.pathname === "/api/gocare/cleveland/protocol") {
          const body = request.method === "POST" ? await request.json().catch(() => ({})) : {};
          const result = await clevelandClinicApi.checkProtocol({
            painLevel: body.painLevel ?? 3,
            symptoms: body.symptoms ?? [],
          });
          return Response.json({ success: true, data: result });
        }

        if (url.pathname === "/api/gocare/dispatch/emergency" && request.method === "POST") {
          const body = await request.json().catch(() => ({}));
          const dispatch = await dispatchApi.dispatchEmergencyUnit({
            patientId: body.patientId || "GC-88294-VN",
            patientName: body.patientName || "BN. Trần Hoài Phương",
            address: body.address || "Biệt thự Palm Garden, Thảo Điền, TP. Thủ Đức",
            code: body.code || "RED",
            painScore: body.painScore || 8,
            symptoms: body.symptoms || ["Đau thắt ngực"],
            notes: body.notes,
          });
          return Response.json({ success: true, data: dispatch });
        }
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
