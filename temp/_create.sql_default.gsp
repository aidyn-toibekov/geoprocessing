<%
  /*
    Создание таблиц
   */

  for (d in th.tables()) {
    def dd = th.dbtable(d)
    if (dd.view) continue // view пропускаем
%>

create table ${d.name} (
<%
    def flds = th.fields(d)
    def lastf = flds[-1]
    for (f in flds) {
      def zpt = ","
      if (f == lastf) zpt = ""
      def notnull = ""
      if (f.hasName("id")) notnull = " not null"
      def sqlType = th.dbfield(f).sqlType
      out("  ${f.name} ${sqlType}${notnull}${zpt}\n")
    }
%>
)
${th.delim}

alter table ${d.name} add constraint pk_${d.name} primary key (id)
${th.delim}
<% } %>

${th.delim}
<% th.domain=th.tables().get('Wax_VerDb'); %>
insert into Wax_VerDb (id, ver) values (1, 0)
${th.delim}
${th.delim}
<%
  /*
    genid simple
   */
  def gentab = th.model.db.service(jandcode.dbm.db.GenIdService).genTableName
%>
create table ${gentab} (
    name varchar(64) not null,
    val bigint
)
${th.delim}

alter table ${gentab} add constraint pk_${gentab} primary key (name)
${th.delim}

<%
  for (t in th.tables()) {
    def dd = th.dbtable(t)
    if (dd.view) continue // view пропускаем
%>
insert into ${gentab} (name, val) values('${t.name.toUpperCase()}', ${dd.genIdStart})
${th.delim}
<% } %>

${th.delim}
