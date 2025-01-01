import Form from "@/components/Form";
import Fieldset from "@/components/Fieldset";
import Field from "@/components/Field";
import Label from "@/components/Label";
import Input from "@/components/Input";
import SubmitButton from "@/components/SubmitButton";
import Button from "@/components/Button";
import Textarea from "@/components/Textarea";

function PhotosUploader({
  title,
  photos,
  optional = false,
  onChange,
  onDelete,
  getPhotoUrl,
}) {
  return (
    <Fieldset>
      <Field>
        <Label htmlFor="photos">
          {title} {optional && <span>(optional)</span>}
        </Label>
        <Input
          id="photos"
          type="file"
          accept="image/*"
          multiple={true}
          onChange={onChange}
        />
        {photos.length > 0 && (
          <div>
            {photos.map((filename, index) => (
              <img
                key={index}
                src={getPhotoUrl(filename)}
                alt={`Photo ${index + 1}`}
                style={{ width: "100px" }}
              />
            ))}
          </div>
        )}
      </Field>
    </Fieldset>
  );
}

export default PhotosUploader;
