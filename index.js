(function (U, n, l, v, e, y, B, k) {
  "use strict";
  const { FormSection: N, FormInput: f, FormRow: A } = v.Forms,
    F = l.findByProps("getCurrentUser", "getUser"),
    O = l.findByProps("getChannel", "getChannelId"),
    $ = l.findByProps("getChannelId", "getLastSelectedChannelId"),
    _ = l.findByProps("openLazy", "hideActionSheet"),
    w = l.findByProps("ActionSheetRow")?.ActionSheetRow ?? v.Forms.FormRow,
    G = l.findByStoreName("MessageStore"),
    j = l.findByStoreName("UserStore"),
    R = l.findByProps("sendMessage", "startEditMessage", "editMessage"),
    W = l.findByProps("showToast"),
    NV = l.findByProps("useNavigation"),
    Q = l.findByStoreName("GuildStore"),
    I = new Map();
  let S = !1;

  function x(r) {
    return ((new Date(r).getTime() - 14200704e5) * 4194304).toString();
  }
  let _lastSnow = 0;
  function genId(r) {
    let b = (new Date(r).getTime() - 14200704e5) * 4194304;
    if (!(b > _lastSnow)) b = _lastSnow + 8192;
    _lastSnow = b;
    return b.toString();
  }
  function lastSundayDate(year, month1) {
    const last = new Date(Date.UTC(year, month1, 0));
    return last.getUTCDate() - last.getUTCDay();
  }
  function ukIsBSTInstant(t) {
    const y = t.getUTCFullYear();
    const start = Date.UTC(y, 2, lastSundayDate(y, 3), 1, 0, 0);
    const end = Date.UTC(y, 9, lastSundayDate(y, 10), 1, 0, 0);
    const ms = t.getTime();
    return ms >= start && ms < end;
  }
  function ukNowDate() {
    const now = new Date();
    const off = ukIsBSTInstant(now) ? 60 : 0;
    const s = new Date(now.getTime() + off * 60000);
    return new Date(
      s.getUTCFullYear(),
      s.getUTCMonth(),
      s.getUTCDate(),
      s.getUTCHours(),
      s.getUTCMinutes(),
      s.getUTCSeconds(),
      s.getUTCMilliseconds(),
    );
  }
  function ukOn() {
    try {
      return e.storage.ukTime !== !1;
    } catch {
      return !0;
    }
  }
  function nowDate() {
    return ukOn() ? ukNowDate() : new Date();
  }
  function nowISO() {
    return nowDate().toISOString();
  }
  const resolving = new Set();
  function extractId(x) {
    try {
      if (!x) return null;
      if (typeof x === "string") return /^\d+$/.test(x) ? x : null;
      if (x.id) return x.id;
      if (x.userId) return x.userId;
      if (x.user && x.user.id) return x.user.id;
    } catch {}
    return null;
  }
  function forceSet(o, k, v) {
    if (!o) return;
    try {
      o[k] = v;
    } catch {}
    try {
      if (o[k] !== v)
        Object.defineProperty(o, k, {
          value: v,
          writable: !0,
          configurable: !0,
          enumerable: !0,
        });
    } catch {}
  }
  function forceNull(o, k) {
    try {
      if (!(k in o)) return;
    } catch {
      return;
    }
    forceSet(o, k, null);
  }
  const EMPTY = {};
  function anyProf() {
    const p = e.storage.profiles;
    if (!p) return !1;
    for (const k in p) return !0;
    return !1;
  }
  function firstProfiledId(args) {
    if (!args) return null;
    if (!anyProf()) return null;
    const profs = e.storage.profiles || EMPTY;
    for (let i5 = 0; i5 < args.length; i5++) {
      const id = extractId(args[i5]);
      if (id && profs[id]) return id;
    }
    return null;
  }
  function createdAtFromId(id) {
    try {
      const ms = Math.floor(Number(id) / 4194304) + 1420070400000;
      if (isFinite(ms)) return new Date(ms);
    } catch {}
    return null;
  }
  function parseUserDate(str) {
    str = ("" + str).trim();
    if (!str) return null;
    let m = str.match(/^(\d{4})[\/\-.](\d{1,2})[\/\-.](\d{1,2})$/);
    if (m) {
      const yr = +m[1],
        mo = +m[2],
        dy = +m[3];
      const d = new Date(yr, mo - 1, dy);
      if (!isNaN(d.getTime()) && d.getMonth() === mo - 1 && d.getDate() === dy)
        return d;
      return null;
    }
    m = str.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
    if (m) {
      let a = +m[1],
        b = +m[2],
        y = +m[3];
      if (y < 100) y += 2000;
      let dy = a,
        mo = b;
      if (mo > 12 && dy <= 12) {
        dy = b;
        mo = a;
      }
      const d = new Date(y, mo - 1, dy);
      if (!isNaN(d.getTime()) && d.getMonth() === mo - 1 && d.getDate() === dy)
        return d;
      return null;
    }
    const d2 = new Date(str);
    if (!isNaN(d2.getTime())) return d2;
    return null;
  }
  function fmtSimple(iso) {
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return "";
      return d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();
    } catch {
      return "";
    }
  }
  function resolveJoined(uid) {
    const prof = (e.storage.profiles || EMPTY)[uid];
    if (!prof) return null;
    if (prof.joinedAt) return prof.joinedAt;
    if (prof.sourceId) {
      const d = createdAtFromId(prof.sourceId);
      if (d) return d.toISOString();
    }
    return null;
  }
  function resolveCreated(uid) {
    const prof = (e.storage.profiles || EMPTY)[uid];
    if (!prof) return null;
    if (prof.accountDate) {
      const d = new Date(prof.accountDate);
      if (!isNaN(d.getTime())) return d;
    }
    if (prof.sourceId) return createdAtFromId(prof.sourceId);
    return null;
  }
  function resolveName(uid) {
    const prof = (e.storage.profiles || EMPTY)[uid];
    if (!prof) return null;
    if (prof.name) return prof.name;
    if (prof.sourceId && !resolving.has(uid)) {
      resolving.add(uid);
      try {
        const src = j.getUser(prof.sourceId);
        if (src)
          return src.globalName || src.global_name || src.username || null;
      } catch {
      } finally {
        resolving.delete(uid);
      }
    }
    return null;
  }
  function resolveUsername(uid) {
    const prof = (e.storage.profiles || EMPTY)[uid];
    if (!prof) return null;
    if (prof.sourceId && !resolving.has(uid)) {
      resolving.add(uid);
      try {
        const src = j.getUser(prof.sourceId);
        if (src) return src.username || null;
      } catch {
      } finally {
        resolving.delete(uid);
      }
    }
    return prof.name || null;
  }
  function resolveAvatar(uid) {
    const prof = (e.storage.profiles || EMPTY)[uid];
    if (!prof) return null;
    if (prof.sourceId && !resolving.has(uid)) {
      resolving.add(uid);
      try {
        const src = j.getUser(prof.sourceId);
        if (src && typeof src.getAvatarURL === "function") {
          const u = src.getAvatarURL();
          if (u) return u;
        }
      } catch {
      } finally {
        resolving.delete(uid);
      }
    }
    return prof.avatar || null;
  }
  const _avSrc = new Map();
  function mirrorSource(id, ret) {
    const uri = resolveAvatar(id);
    if (!uri) return ret;
    const prev = _avSrc.get(id);
    if (prev && prev.uri === uri) return prev.obj;
    const obj =
      ret && typeof ret === "object"
        ? Object.assign({}, ret, { uri: uri })
        : { uri: uri };
    _avSrc.set(id, { uri: uri, obj: obj });
    return obj;
  }
  function resolveBanner(uid) {
    const prof = (e.storage.profiles || EMPTY)[uid];
    if (!prof || !prof.sourceId) return null;
    if (resolving.has("b" + uid)) return null;
    resolving.add("b" + uid);
    try {
      const src = j.getUser(prof.sourceId);
      if (src && typeof src.getBannerURL === "function") {
        let u;
        try {
          u = src.getBannerURL({ size: 2048 });
        } catch {}
        if (!u)
          try {
            u = src.getBannerURL();
          } catch {}
        if (u) return u;
      }
      let bh = src && src.banner;
      if (!bh)
        try {
          const UPS = l.findByStoreName("UserProfileStore");
          const sp = UPS && UPS.getUserProfile(prof.sourceId);
          if (sp && sp.banner) bh = sp.banner;
        } catch {}
      if (bh) {
        const ext = ("" + bh).indexOf("a_") === 0 ? "gif" : "png";
        return (
          "https://cdn.discordapp.com/banners/" +
          prof.sourceId +
          "/" +
          bh +
          "." +
          ext +
          "?size=2048"
        );
      }
    } catch {
    } finally {
      resolving.delete("b" + uid);
    }
    return null;
  }
  function resolveAccent(uid) {
    const prof = (e.storage.profiles || EMPTY)[uid];
    if (!prof || !prof.sourceId) return null;
    if (resolving.has("a" + uid)) return null;
    resolving.add("a" + uid);
    try {
      const src = j.getUser(prof.sourceId);
      if (src && src.accentColor != null) return src.accentColor;
    } catch {
    } finally {
      resolving.delete("a" + uid);
    }
    return null;
  }
  function mkAuthor(uid) {
    let u = null;
    try {
      u = j.getUser(uid);
    } catch {}
    const dn = resolveName(uid);
    const un = resolveUsername(uid);
    const av = resolveAvatar(uid);
    return {
      id: uid,
      username: un || (u ? u.username : "FakeUser"),
      global_name: dn || (u ? u.globalName || u.global_name || null : null),
      discriminator: u ? u.discriminator : "0001",
      avatar: av || (u ? u.avatar : null),
      bot: u ? u.bot : !1,
    };
  }
  let selfActive = !1,
    selfId = null,
    selfAt = 0,
    _cuReal = null,
    _cuId = null,
    _cuProxy = null;
  function spoofCU(real, id) {
    try {
      if (_cuProxy && _cuReal === real && _cuId === id) return _cuProxy;
      const desc = Object.getOwnPropertyDescriptors(real);
      delete desc.id;
      const clone = Object.create(Object.getPrototypeOf(real), desc);
      Object.defineProperty(clone, "id", {
        value: id,
        writable: !0,
        enumerable: !0,
        configurable: !0,
      });
      try {
        const ca = resolveCreated(id);
        if (ca) forceSet(clone, "createdAt", ca);
      } catch {}
      ((_cuReal = real), (_cuId = id), (_cuProxy = clone));
      return clone;
    } catch {
      return real;
    }
  }
  function resolveServerName(inlineId, channelId) {
    try {
      let id = inlineId;
      if (!id) id = ("" + (e.storage.serverTagId || "")).trim();
      if (!id) {
        const ch = O && O.getChannel && O.getChannel(channelId);
        id = ch && ch.guild_id;
      }
      if (id && Q && Q.getGuild) {
        const g = Q.getGuild(id);
        if (g && g.name) return g.name;
      }
    } catch {}
    return null;
  }
  function applyTags(content, channelId) {
    if (!content || content.indexOf("[server") === -1) return content;
    let out = content.replace(/\[server:(\d{5,25})\]/gi, function (m, id) {
      return resolveServerName(id, channelId) || m;
    });
    out = out.replace(/\[server\]/gi, function (m) {
      return resolveServerName(null, channelId) || m;
    });
    return out;
  }
  
  async function P(r, s, c, u, t, ref) {
    c = applyTags(c, r);
    const d = t || genId(u || nowISO());
    try {
      const g = u || nowISO(),
        h = {
          id: d,
          type: 0,
          channel_id: r,
          author: mkAuthor(s),
          content: c,
          nonce: d,
          mentions: [],
          mention_roles: [],
          pinned: !1,
          tts: !1,
          attachments: [],
          embeds: [],
          timestamp: g,
          edited_timestamp: null,
          state: "SENT",
          fake: !0,
        };
      if (ref && ref.id) {
        h.type = 19;
        h.message_reference = { message_id: ref.id, channel_id: r };
        try {
          const gid = O?.getChannel?.(r)?.guild_id;
          if (gid) h.message_reference.guild_id = gid;
        } catch {}
        h.referenced_message = {
          id: ref.id,
          type: 0,
          channel_id: r,
          author: mkAuthor(ref.userId),
          content: ref.content,
          mentions: [],
          mention_roles: [],
          pinned: !1,
          tts: !1,
          attachments: [],
          embeds: [],
          timestamp: ref.timestamp || g,
          edited_timestamp: null,
          state: "SENT",
          fake: !0,
        };
      }
      n.FluxDispatcher.dispatch({
        type: "MESSAGE_CREATE",
        channelId: r,
        message: h,
        otherPluginBypass: !0,
      });
      try {
        n.FluxDispatcher.dispatch({
          type: "MESSAGE_ACK",
          channelId: r,
          messageId: d,
          manual: !0,
          immediate: !0,
        });
      } catch {}
      try {
        addLinkEmbeds(r, h, c);
      } catch {}
    } catch {}
  }

  function decodeEntities(str) {
    return ("" + str)
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#0?39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&#x2F;/gi, "/")
      .trim();
  }
  async function fetchT(url, ms, opts) {
    const ctl =
      typeof AbortController === "function" ? new AbortController() : null;
    const timer = ctl
      ? setTimeout(function () {
          try {
            ctl.abort();
          } catch {}
        }, ms || 8000)
      : null;
    try {
      return await fetch(
        url,
        Object.assign({}, opts, ctl ? { signal: ctl.signal } : {}),
      );
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
  function metaTag(html, prop) {
    try {
      let m = html.match(
        new RegExp(
          '<meta[^>]+(?:property|name)=["\\\']' +
            prop +
            '["\\\'][^>]*?content=["\\\']([^"\\\']*)["\\\']',
          "i",
        ),
      );
      if (m && m[1]) return decodeEntities(m[1]);
      m = html.match(
        new RegExp(
          '<meta[^>]+content=["\\\']([^"\\\']*)["\\\'][^>]*?(?:property|name)=["\\\']' +
            prop +
            '["\\\']',
          "i",
        ),
      );
      if (m && m[1]) return decodeEntities(m[1]);
    } catch {}
    return null;
  }
  function ytId(url) {
    let m;
    if ((m = url.match(/[?&]v=([\w-]{11})/))) return m[1];
    if ((m = url.match(/youtu\.be\/([\w-]{11})/))) return m[1];
    if ((m = url.match(/youtube\.com\/shorts\/([\w-]{11})/))) return m[1];
    if ((m = url.match(/youtube\.com\/embed\/([\w-]{11})/))) return m[1];
    if ((m = url.match(/youtube\.com\/live\/([\w-]{11})/))) return m[1];
    return null;
  }
  async function fetchYouTube(url) {
    const vid = ytId(url);
    let data = {};
    try {
      const res = await fetchT(
        "https://www.youtube.com/oembed?format=json&url=" +
          encodeURIComponent(url),
        8000,
      );
      if (res && res.ok) data = await res.json();
    } catch {}
    if (!vid && !data.title) return null;
    const w = data.thumbnail_width || 1280,
      h = data.thumbnail_height || 720,
      embed = {
        type: vid ? "video" : "rich",
        url: url,
        color: 0xff0000,
        provider: { name: "YouTube", url: "https://www.youtube.com" },
      };
    if (data.title) embed.title = ("" + data.title).slice(0, 256);
    if (data.author_name)
      embed.author = { name: data.author_name, url: data.author_url };
    const thumb =
      data.thumbnail_url ||
      (vid ? "https://i.ytimg.com/vi/" + vid + "/hqdefault.jpg" : null);
    if (thumb)
      embed.thumbnail = { url: thumb, proxy_url: thumb, width: w, height: h };
    if (vid)
      embed.video = {
        url: "https://www.youtube.com/embed/" + vid,
        width: 1280,
        height: 720,
      };
    return embed;
  }
  async function fetchOpenGraph(url) {
    try {
      const res = await fetchT(url, 8000, {
        headers: {
          Accept: "text/html,application/xhtml+xml",
          "User-Agent":
            "Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)",
        },
      });
      if (!res || !res.ok) return null;
      let html = await res.text();
      if (html && html.length > 6e5) html = html.slice(0, 6e5);
      const title =
        metaTag(html, "og:title") ||
        metaTag(html, "twitter:title") ||
        (function () {
          const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
          return m ? decodeEntities(m[1]) : null;
        })();
      const desc =
        metaTag(html, "og:description") ||
        metaTag(html, "twitter:description") ||
        metaTag(html, "description");
      const image =
        metaTag(html, "og:image") ||
        metaTag(html, "og:image:url") ||
        metaTag(html, "twitter:image");
      const site = metaTag(html, "og:site_name");
      if (!title && !desc && !image) return null;
      const embed = { type: "rich", url: url, color: 0x4f545c };
      if (title) embed.title = title.slice(0, 256);
      if (desc) embed.description = desc.slice(0, 350);
      if (site) embed.footer = { text: site };
      if (image)
        embed.image = {
          url: image,
          proxy_url: image,
        };
      return embed;
    } catch {
      return null;
    }
  }
  async function fetchOneEmbed(url) {
    try {
      if (
        /(?:youtube\.com\/watch\?|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/embed\/)/i.test(
          url,
        )
      )
        return await fetchYouTube(url);
      if (/\.(png|jpe?g|gif|webp|bmp)(\?|#|$)/i.test(url))
        return {
          type: "image",
          url: url,
          image: { url: url, proxy_url: url },
        };
      return await fetchOpenGraph(url);
    } catch {
      return null;
    }
  }
  async function fetchEmbeds(content) {
    const out = [];
    try {
      const urls = ("" + (content || "")).match(/https?:\/\/[^\s<>]+/g) || [];
      const seen = {};
      for (let i2 = 0; i2 < urls.length && out.length < 4; i2++) {
        let url = urls[i2].replace(/[)\]\.,!?'"]+$/, "");
        if (seen[url]) continue;
        seen[url] = !0;
        const em = await fetchOneEmbed(url);
        if (em) out.push(em);
      }
    } catch {}
    return out;
  }
  function addLinkEmbeds(channelId, message, content) {
    try {
      if (e.storage.embedsEnabled === !1) return;
      if (!/https?:\/\//i.test("" + (content || ""))) return;
      fetchEmbeds(content)
        .then(function (embeds) {
          if (!embeds || !embeds.length) return;
          try {
            n.FluxDispatcher.dispatch({
              type: "MESSAGE_UPDATE",
              message: Object.assign({}, message, { embeds: embeds }),
              otherPluginBypass: !0,
            });
          } catch {}
        })
        .catch(function () {});
    } catch {}
  }
  function L(r) {
    ((e.storage.savedMessages = r), (e.storage._lastUpdate = Date.now()));
  }
  function z(r, s, c, u, t, ref) {
    const d = e.storage.savedMessages || [];
    const rec = {
      id: u,
      channelId: r,
      userId: s,
      content: c,
      timestamp: t,
      createdAt: Date.now(),
    };
    if (ref) rec.replyTo = ref;
    (d.push(rec), L(d));
  }
  function H(r) {
    (e.storage.savedMessages || [])
      .filter(function (s) {
        return s.channelId === r;
      })
      .forEach(function (s) {
        P(s.channelId, s.userId, s.content, s.timestamp, s.id, s.replyTo);
      });
  }
  function Y() {
    return $?.getChannelId() || O?.getChannelId?.() || null;
  }
  function tt(r) {
    try {
      W?.showToast?.(r);
    } catch {}
  }
  function mkISO(Y0, Mo, D0, H0, Mi, useUTC) {
    const dt = useUTC
      ? new Date(Date.UTC(Y0, Mo - 1, D0, H0, Mi, 0, 0))
      : new Date(Y0, Mo - 1, D0, H0, Mi, 0, 0);
    return isNaN(dt.getTime()) ? null : dt.toISOString();
  }
  function parseTime(str, base, useUTC) {
    const s = (str || "").trim();
    if (!s) return null;
    let m;
    if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})[ T]+(\d{1,2}):(\d{2})$/)))
      return mkISO(+m[1], +m[2], +m[3], +m[4], +m[5], useUTC);
    if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)))
      return mkISO(+m[1], +m[2], +m[3], 0, 0, useUTC);
    if ((m = s.match(/^(\d{1,2})(?::(\d{2}))?\s*([ap]m)$/i))) {
      let H0 = +m[1];
      const Mi = m[2] ? +m[2] : 0,
        ap = m[3].toLowerCase();
      (ap === "pm" && H0 !== 12 && (H0 += 12), ap === "am" && H0 === 12 && (H0 = 0));
      return mkISO(base.y, base.mo, base.d, H0, Mi, useUTC);
    }
    if ((m = s.match(/^(\d{1,2}):(\d{2})$/)))
      return mkISO(base.y, base.mo, base.d, +m[1], +m[2], useUTC);
    return null;
  }
  function pRef(tok) {
    if (!tok) return null;
    const nn = tok.slice(1);
    return nn ? { line: parseInt(nn, 10) } : { prev: !0 };
  }
  function parseLine(line) {
    const raw = (line || "").trim();
    if (!raw) return null;
    let m;
    if (
      (m = raw.match(
        /^([^\s\[\^|:\-\u2013\u2014]+)\s*\[([^\]]+)\]\s*(\^\d*)?\s*[-\u2013\u2014|:]\s*([\s\S]*)$/,
      ))
    )
      return { uid: m[1], time: m[2].trim(), reply: pRef(m[3]), content: m[4] };
    if (
      (m = raw.match(
        /^([^\s\[\^|:\-\u2013\u2014]+)\s*(\^\d*)?\s*[-\u2013\u2014|:]\s*([\s\S]*)$/,
      ))
    )
      return { uid: m[1], time: null, reply: pRef(m[2]), content: m[3] };
    return null;
  }
  function _randGapMs() {
    return Math.floor(6e4 + Math.random() * 6e4);
  }
  async function runConvo() {
    const ch = Y();
    if (!ch) {
      tt("No channel selected.");
      return;
    }
    const text = e.storage.conversationText || "",
      lines = text.split(/\r?\n/),
      useUTC = ukOn() ? !1 : e.storage.useUTC || !1,
      now = nowDate(),
      base = {
        y: e.storage.customYear || now.getFullYear(),
        mo: e.storage.customMonth || now.getMonth() + 1,
        d: e.storage.customDay || now.getDate(),
      };
    const items = [];
    for (const line of lines) {
      const parsed = parseLine(line);
      if (!parsed || !parsed.content.trim()) continue;
      let uid = parsed.uid;
      if (/^(me|self)$/i.test(uid)) uid = F.getCurrentUser()?.id;
      else if (/^(them|they|user)$/i.test(uid)) uid = (e.storage.userId || "").trim();
      if (!uid) continue;
      const explicit = parsed.time ? parseTime(parsed.time, base, useUTC) : null;
      items.push({
        uid: uid,
        content: parsed.content,
        reply: parsed.reply,
        explicit: explicit || null,
      });
    }
    let cursor = nowDate().getTime();
    for (let i = 0; i < items.length; i++) {
      if (items[i].explicit) {
        const t0 = new Date(items[i].explicit).getTime();
        if (!isNaN(t0)) {
          cursor = t0;
          break;
        }
      }
    }
    let count = 0;
    const built = [];
    for (const it of items) {
      let iso;
      if (it.explicit) {
        const t = new Date(it.explicit).getTime();
        if (!isNaN(t)) {
          cursor = t;
          iso = new Date(t).toISOString();
        } else {
          iso = new Date(cursor).toISOString();
        }
      } else {
        iso = new Date(cursor).toISOString();
      }
      cursor += _randGapMs();
      const id = genId(iso);
      let ref = null;
      if (it.reply) {
        const target = it.reply.prev
          ? built[built.length - 1]
          : built[it.reply.line - 1];
        if (target)
          ref = {
            id: target.id,
            userId: target.userId,
            content: target.content,
            timestamp: target.timestamp,
          };
      }
      (await P(ch, it.uid, it.content, iso, id, ref),
        z(ch, it.uid, it.content, id, iso, ref),
        built.push({
          id: id,
          userId: it.uid,
          content: it.content,
          timestamp: iso,
        }),
        count++);
    }
    tt(count ? `Sent ${count} message${count === 1 ? "" : "s"}.` : "No valid lines found.");
  }
  function _extractUserId(input) {
    const s = ("" + (input || "")).trim();
    if (!s) return null;
    let m = s.match(/^<@!?(\d{17,20})>$/);
    if (m) return m[1];
    m = s.match(/users\/(\d{17,20})\b/);
    if (m) return m[1];
    if (/^\d{17,20}$/.test(s)) return s;
    return null;
  }
  function _dmNameFor(id) {
    try {
      const u = j.getUser(id);
      if (u) return u.globalName || u.global_name || u.username || id;
    } catch {}
    return id;
  }
  function _tryOpenPrivate(acts, id) {
    if (!acts || typeof acts.openPrivateChannel !== "function") return !1;
    const shapes = [id, { recipientId: id }, { userId: id }];
    for (let i = 0; i < shapes.length; i++) {
      try {
        acts.openPrivateChannel(shapes[i]);
        return !0;
      } catch {}
    }
    return !1;
  }
  function _pushMessagesScreen(channelId) {
    try {
      const RA = l.findByProps("handleTapChannel");
      if (RA && typeof RA.handleTapChannel === "function") {
        RA.handleTapChannel(channelId);
        return !0;
      }
    } catch {}
    try {
      const RA2 = l.findByProps("handlePressChannel");
      if (RA2 && typeof RA2.handlePressChannel === "function") {
        RA2.handlePressChannel(channelId);
        return !0;
      }
    } catch {}
    try {
      const NavRef = l.findByProps("getRootNavigationRef");
      const ref =
        NavRef &&
        typeof NavRef.getRootNavigationRef === "function" &&
        NavRef.getRootNavigationRef();
      if (ref && typeof ref.navigate === "function") {
        const routes = ["messages", "Messages", "Channel", "channel"];
        for (let i = 0; i < routes.length; i++) {
          try {
            ref.navigate(routes[i], { channelId: channelId });
            return !0;
          } catch {}
        }
      }
    } catch {}
    return !1;
  }
  function _tryNavigate(channelId) {
    if (!channelId) return !1;
    const sc = l.findByProps("selectChannel");
    if (sc && typeof sc.selectChannel === "function") {
      const shapes = [
        { guildId: null, channelId: channelId },
        { guildId: "@me", channelId: channelId },
        { channelId: channelId },
        channelId,
      ];
      for (let i = 0; i < shapes.length; i++) {
        try {
          sc.selectChannel(shapes[i]);
          _pushMessagesScreen(channelId);
          return !0;
        } catch {}
      }
    }
    if (_pushMessagesScreen(channelId)) return !0;
    const tr = l.findByProps("transitionToChannel");
    if (tr && typeof tr.transitionToChannel === "function") {
      try {
        tr.transitionToChannel(channelId);
        return !0;
      } catch {}
    }
    const oc = l.findByProps("openChannel");
    if (oc && typeof oc.openChannel === "function") {
      try {
        oc.openChannel({ channelId: channelId });
        return !0;
      } catch {}
    }
    return !1;
  }
  function _findExistingDM(id) {
    try {
      const CS = l.findByStoreName("ChannelStore");
      const PCS = l.findByStoreName("PrivateChannelStore");
      let cid = null;
      try {
        if (PCS && typeof PCS.getDMFromUserId === "function")
          cid = PCS.getDMFromUserId(id);
      } catch {}
      if (cid) {
        const ch = CS && CS.getChannel ? CS.getChannel(cid) : null;
        if (ch && ch.type === 1) return cid;
      }
      let ids = [];
      try {
        if (PCS && typeof PCS.getPrivateChannelIds === "function")
          ids = PCS.getPrivateChannelIds() || [];
      } catch {}
      for (let i = 0; i < ids.length; i++) {
        const ch = CS && CS.getChannel ? CS.getChannel(ids[i]) : null;
        if (!ch || ch.type !== 1) continue;
        const r = ch.recipients || [];
        if (r.length !== 1) continue;
        const rid = typeof r[0] === "string" ? r
