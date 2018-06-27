package geoprocessing.main.model.experiment.file;

public class Dobeshy {

    private double val0 = 0;
    private double val1 = 0;
    private double val2 = 0;
    private double val3 = 0;


    private long valCnt = 0;

    public Dobeshy() {
        val0 = 0;
        val1 = 0;
        val2 = 0;
        val3 = 0;
        valCnt = 0;
    }

    public void setValue(double value) {
        if (valCnt < 4) {
            valCnt = valCnt + 1;
        }

        val0 =val1;
        val1 =val2;
        val2 =val3;
        val3 =value;
    }

    public double getValue(){
        return (val0+val1+val2+val3)/valCnt;
    }
}
