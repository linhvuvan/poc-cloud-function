import * as pulumi from '@pulumi/pulumi';
import * as gcp from '@pulumi/gcp';

const RESOURCE_PREFIX = 'poc-cloud-function';

const prefix = (name: string) => `${RESOURCE_PREFIX}-${name}`;

const bucket = new gcp.storage.Bucket(prefix('bucket'), {
  location: 'US',
});

const object = new gcp.storage.BucketObject(prefix('object'), {
  bucket: bucket.name,
  source: new pulumi.asset.FileArchive('../app'),
});

const func = new gcp.cloudfunctions.Function(prefix('function'), {
  sourceArchiveBucket: bucket.name,
  runtime: 'nodejs16',
  entryPoint: 'app',
  triggerHttp: true,
  sourceArchiveObject: object.name,
});

new gcp.cloudfunctions.FunctionIamMember(prefix('function-iam-member'), {
  cloudFunction: func.name,
  role: 'roles/cloudfunctions.invoker',
  member: 'allUsers',
});

export const httpsTriggerUrl = func.httpsTriggerUrl;
