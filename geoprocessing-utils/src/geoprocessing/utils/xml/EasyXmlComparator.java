package geoprocessing.utils.xml;

import jandcode.utils.easyxml.EasyXml;

/**
 * Сравнение EasyXml
 */
public class EasyXmlComparator {

    /**
     * Сравнение узлов на идентичность. Проверяется полная идентичность,
     * включая порядок узлов.
     *
     * @param x1 узел 1
     * @param x2 узел 2
     * @return true, если равны
     */
    public boolean equals(EasyXml x1, EasyXml x2) {
        return equalsNode(x1, x2);
    }

    //////

    protected boolean equalsNode(EasyXml x1, EasyXml x2) {
        if (!x1.hasName(x2.getName())) {
            return false;
        }
        if (x1.hasAttrs() != x2.hasAttrs()) {
            return false;
        }
        if (x1.hasAttrs()) {
            if (x1.getAttrs().size() != x2.getAttrs().size()) {
                return false;
            }
            for (String an : x1.getAttrs().keySet()) {
                String s1 = x1.getAttrs().getValueString(an);
                String s2 = x2.getAttrs().getValueString(an);
                if (!s1.equals(s2)) {
                    return false;
                }
            }
        }
        //
        if (x1.hasChilds() != x2.hasChilds()) {
            return false;
        }

        if ( x1.hasChilds() ) {
            if ( x1.getCountChilds() != x2.getCountChilds() ){
                return false;
            }
        }

        if (x1.hasChilds()) {
            for (int i = 0; i < x1.getCountChilds(); i++) {
                EasyXml n1 = x1.getChild(i);
                EasyXml n2 = x2.getChild(i);
                if (!equalsNode(n1, n2)) {
                    return false;
                }
            }
        }
        //
        return true;
    }

}
