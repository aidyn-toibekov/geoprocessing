<%
  for (d in th.tables()) {
    def dd = th.dbtable(d)
    if (dd.view) continue // view пропускаем
    def flds = th.fields(d)
    for (f in flds) {
      if (f.hasRef()) {
        if (th.findDomain(f.refName) == null) continue // ссылка в никуда (memdict например)
        def dref = th.dbtable(f.refName)
        if (dref.view) continue // ссылки на view пропускаем
        def fd = th.dbfield(f)
%>

alter table ${d.name} add constraint ${th.dbDriver.makeShortIdn('fk_' + d.name + '_' + f.name)}
foreign key(${f.name}) references ${f.refName}(id) <% if (fd.refCascade) { %> on delete cascade <% }; %>
${th.delim}
<%
      }
    }

    for (idx in dd.indexes) {
      def uniq = ''
      if (idx.unique) uniq = 'unique '
      def idxname = th.dbDriver.makeShortIdn('i_' + d.name + '_' + idx.name)
      def iflds = ""
      for (fi in idx.fields) {
        if (iflds != "") iflds = iflds + ","
        iflds = iflds + fi.name
        if (fi.desc) iflds = iflds + " desc"
      }
%>

create ${uniq}index ${idxname} on ${d.name}(${iflds})
${th.delim}
<%
    }
  }
%>

${th.delim}
