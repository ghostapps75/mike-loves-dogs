import { createClient, ApiKeyStrategy } from "@wix/api-client";

const wixClient = createClient({
  auth: ApiKeyStrategy({
    apiKey: "IST.eyJraWQiOiJQb3pIX2FDMiIsImFsZyI6IlJTMjU2In0.eyJkYXRhIjoie1wiaWRcIjpcIjI2OGYyNDU4LWM2MDItNDEwZC04MjgyLTBiOWY0ZmUxZmNiM1wiLFwiaWRlbnRpdHlcIjp7XCJ0eXBlXCI6XCJhcHBsaWNhdGlvblwiLFwiaWRcIjpcIjEyNmU2NWNjLTVmMjUtNDgzNy1iNmY2LWVlZmJiZWY0MGMwN1wifSxcInRlbmFudFwiOntcInR5cGVcIjpcImFjY291bnRcIixcImlkXCI6XCJkM2UyMDI3Zi1iOTdkLTQzMDYtYTNmNi05OGJiMTZjZTRjYjZcIn19IiwiaWF0IjoxNzc2NDYxNDI0fQ.SuyixGQqQ23xqB1LUz2B5Bas8po3WhsvUX56JKKxTqL8jpfStd20xvef0g9pxrqi-7EF4znCkgN3Gz-GkEyYBpmDrfjsGh-U9_jjb8RorDoT_MoO0dR-_FOzTJaJzQwIKYp7j8ZQ0pPE2TmYM-X6duqqXhZu13VOrm6vw-mmVOZ1vv8f9m7GY4_N03p-p1wXXNs45PVYZDS0911_HNZ_TvLAdpDiYmoFb7thG3Bj5Fri6E7ONCzSRfbApXRZS6d9sqQJAXxOmLI_p9koZRG-jGRJXq5RBvurlIiAWOyh732DAo9XEYZuirFxOP8HhRBrW4_kaZQJDI10yNhgTU2Glw",
    siteId: "9b55af94-af46-4cd6-a779-1cb53d26a3ac"
  })
});

async function main() {
  try {
    const res = await wixClient.fetchWithAuth('https://www.wixapis.com/wix-data/v2/collections');
    const data = await res.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(error);
  }
}

main();
