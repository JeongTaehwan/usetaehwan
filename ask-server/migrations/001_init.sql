-- 코퍼스 · 임베딩 · 가드레일 카운터 · 메타 로그 (design §4.3)
create extension if not exists vector;

create table if not exists documents (
  doc_id       text primary key,
  source_path  text not null,
  title        text not null,
  url          text not null,
  kind         text not null,
  content_hash text not null,
  updated_at   timestamptz not null default now()
);

create table if not exists chunks (
  chunk_id     text primary key,          -- doc_id#anchor(~n) — 위치가 아니라 앵커 기준
  doc_id       text not null references documents on delete cascade,
  section      text not null,
  anchor       text not null,
  breadcrumb   text not null,
  body         text not null,
  chunk_hash   text not null              -- sha256(breadcrumb + body)
);

-- 모델별로 행을 나눠 같은 DB에서 후보 임베딩을 나란히 비교한다 (D-12).
-- 차원을 고정하지 않고 ANN 인덱스도 두지 않는다 — 청크 수백 개는 전체 스캔이 정확하고 충분히 빠르다 (D-09).
create table if not exists embeddings (
  chunk_id     text not null references chunks on delete cascade,
  model        text not null,
  chunk_hash   text not null,             -- 임베딩한 시점의 해시. chunks.chunk_hash와 다르면 다시 임베딩
  embedding    vector not null,
  primary key (chunk_id, model)
);

create table if not exists ask_usage_daily (
  day        date primary key,
  questions  int not null default 0,
  cost_usd   numeric(10, 5) not null default 0
);

-- IP 원문은 저장하지 않는다. ip_hash = HMAC(비밀, ip || 날짜) — 날이 바뀌면 연결되지 않는다 (D-19)
create table if not exists ask_ip_daily (
  day        date not null,
  ip_hash    bytea not null,
  questions  int not null default 0,
  primary key (day, ip_hash)
);

-- 질문/응답 원문 없이 메타만
create table if not exists ask_logs (
  id              bigserial primary key,
  created_at      timestamptz not null default now(),
  lang            text,
  category        text,
  outcome         text,
  question_chars  int,
  n_candidates    int,
  n_evidence      int,
  cited_chunk_ids text[],
  attempts        int,
  violations      text[],
  latency_ms      int,
  input_tokens    int,
  output_tokens   int,
  cost_usd        numeric(10, 6),
  llm             text,
  embedder        text
);
