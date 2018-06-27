package geoprocessing.main.model.experiment.file;

public class Haar {

    private double val0 = 0;
    private double val1 = 0;


    private long valCnt = 0;

    public Haar() {
        val0 = 0;
        val1 = 0;
        valCnt = 0;
    }

    public void setValue(double value) {
        if (valCnt < 2) {
            valCnt = valCnt + 1;
        }

        val0 =val1;
        val1 =value;
    }

    public double getValue(){
        return (val0+val1)/valCnt;
    }
}
