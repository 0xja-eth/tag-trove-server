import {BaseInterface, body, custom, get, params, post, route} from "../http/InterfaceManager";
import {Tag, TagState} from "./models/Tag";
import {tagMgr} from "./TagManager";
import {auth, AuthType, Payload} from "../user/AuthManager";
import {SignInfo, SignType} from "../user/SignManager";
import {Relation, RID} from "../user/models/Relation";

type InputPoseidon<T> = string;

type InputCredentialId = string;
type InputSourceSecret = string;
type InputSourceSecretHash = InputPoseidon<[InputSourceSecret, 1]> // Commitment

type InputDestinationIdentifier = string;
type InputCommitmentMapperPubKey = [string, string];
type InputExternalNullifier = InputCredentialId;
type InputNullifier = InputPoseidon<
  [InputSourceSecretHash, InputExternalNullifier]
  >;

export type SnarkProof = {
  a: [string, string];
  b: [[string, string], [string, string]];
  c: [string, string];
  // input: string[];
  input: [
    InputDestinationIdentifier,
    ...InputCommitmentMapperPubKey,
    InputExternalNullifier,
    InputNullifier
  ]
}

@route("/tag")
export class TagInterface extends BaseInterface {

  @get("/tags")
  async getTags() {
    return await Tag.findAll({
      where: {state: TagState.Active}
    });
  }
  @get("/scanResult")
  async getScanResult() {
    return { rootResults: tagMgr().rootResults }
  }
  @get("/registryRoot")
  async getRegistryRoot() {
    return tagMgr().getRegistryRoot();
  }

  // Admin

  @post("/scan")
  async scan(
    @body("rids", true) rids: RID[]
  ) {
    if (!rids) await tagMgr().scanForAll()
    else await tagMgr().scanForRelations(rids.map(Relation.fromRID))
  }
  @post("/scan/:rid")
  async scanForRelation(
    @params("rid") rid: RID
  ) {
    const relation = Relation.fromRID(rid)
    await tagMgr().scanForRelations([relation])
  }
  @post("/tags/update")
  async updateTags() {
    await tagMgr().updateTags()
  }

  @post("/mint")
  @auth(AuthType.Normal)
  async mintSBT(
    @body("signInfo") signInfo: SignInfo,
    @body("snarkProofs") snarkProofs: SnarkProof[],
    @body("tagIds") tagIds: string[],
    @custom("auth") _auth: Payload) {

    // TODO: 重新实现
  }

}
