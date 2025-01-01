import Form from "@/components/Form";
import Fieldset from "@/components/Fieldset";
import Field from "@/components/Field";
import Label from "@/components/Label";
import Input from "@/components/Input";
import SubmitButton from "@/components/SubmitButton";
import Button from "@/components/Button";
import Textarea from "@/components/Textarea";

function AvatarUploader({
  avatar,
  optional = false,
  onChange,
  onDelete,
  getAvatarUrl,
}) {
  return (
    <Fieldset>
      <Field>
        <Label htmlFor="avatar">
          Avatar {optional && <span>(optional)</span>}
        </Label>
        <Input
          id="avatar"
          type="file"
          accept="image/*"
          multiple={false}
          onChange={onChange}
        />
        {avatar && (
          <div>
            <img
              src={getAvatarUrl(avatar)}
              alt="Your avatar"
              style={{ width: "100px" }}
            />
            <Button onClick={onDelete}>Remove avatar</Button>
          </div>
        )}
      </Field>
    </Fieldset>
  );
}

export default AvatarUploader;
