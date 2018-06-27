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

%>

alter table ${d.name} drop constraint ${th.dbDriver.makeShortIdn('fk_' + d.name + '_' + f.name)}
${th.delim}
<%
      }
    }

    for (idx in dd.indexes) {
      def idxname = th.dbDriver.makeShortIdn('i_' + d.name + '_' + idx.name)
%>

drop index ${idxname}
${th.delim}
<%
    }
  }
%>

${th.delim}
