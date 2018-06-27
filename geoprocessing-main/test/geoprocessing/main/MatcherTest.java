package geoprocessing.main;

import org.junit.*;

import java.util.regex.*;

public class MatcherTest {

    @Test
    public void name() {
        String s = "2.2;2.2;2.2;";

        String pp = "^\\d+(.\\d)?;\\d+(.\\d)?;\\d+(.\\d)?;$";
        Pattern p = Pattern.compile(pp);
        Matcher m = p.matcher(s.replaceAll(",", "."));

        System.out.println(m.matches());
    }
}
