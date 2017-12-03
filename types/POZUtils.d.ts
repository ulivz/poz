import {POZLogger} from "./POZlogger";
import fs from "fs-extra"

export interface POZUtils {
  string: StringUtil;
  logger: POZLogger;
  datatypes: DatatypesUtil;
  shell: ShellUtil;
  prompts: PromptsUtil;
  fs: FileSystemUtil;
  render(template: string, context: string): string;
}

interface StringUtil {

}

interface DatatypesUtil {

}

interface ShellUtil {

}

interface PromptsUtil {

}

interface FileSystemUtil extends fs {

}
