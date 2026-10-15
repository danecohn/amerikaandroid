import com.android.tools.build.bundletool.BundleToolMain;
public class BuildTestingApk {
 public static void main(String[] args) {
  if(args.length!=3)throw new IllegalArgumentException("Provide bundle, output APK set and local keystore paths.");
  String secret=System.getenv("AMERIKA_SIGNING_PASSWORD");
  if(secret==null||secret.isEmpty())throw new IllegalStateException("Signing password is missing from the private process environment.");
  // Keep the password out of command-line arguments and temporary plaintext files.
  BundleToolMain.main(new String[]{"build-apks","--bundle="+args[0],"--output="+args[1],"--mode=universal","--ks="+args[2],"--ks-key-alias=amerika-upload","--ks-pass=pass:"+secret,"--key-pass=pass:"+secret,"--overwrite"});
 }
}
